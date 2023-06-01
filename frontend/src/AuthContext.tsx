import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { JwtAuthClaims, LoginProvider } from '../../interface/Model'
import { LoginCallback, LoginProviders } from './loaders'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { stringify} from '@supercharge/json'
import * as jose from 'jose'
import Cookies from 'js-cookie'

const AuthContext = createContext<AuthContextType>(undefined as any as AuthContextType)
export default AuthContext

const jwtCookieName = 'jwt'
const localStorageKeys = {
    user: 'user', //stores the json user
}

export interface AuthenticatedUser {
    token(): string
    logout(): Promise<void>

    name(): string
    admin(): boolean
}

class JwtUser implements AuthenticatedUser {
    jwt: string
    logoutFn: () => void
    constructor(jwt: string, logoutFn: () => void) {
        this.jwt = jwt
        this.logoutFn = logoutFn
    }
    token(): string {
        return this.jwt
    }
    async logout(): Promise<void> {
        return this.logoutFn()
    }

    parse(): JwtAuthClaims {
        try {
            return jose.decodeJwt(this.jwt) as any as JwtAuthClaims
        } catch (err) {
            this.logout()
            return {} as JwtAuthClaims
        }
    }
    name(): string {
        return this.parse().name
    }
    admin(): boolean {
        return this.parse().admin
    }
}

export interface AuthContextType {
    isLoading: boolean // INITIAL load

    providers: Array<LoginProvider> // will error if called whilst loading
    login(provider: LoginProvider): void // will probably trigger path reloads
    logout(): void
    callback(provider: LoginProvider, params: Record<string, string>): Promise<void> // needed for Oauth2 callbacks
    currentUser: AuthenticatedUser | null
}

const loadingContext: AuthContextType = {
    isLoading: true,
    providers: [],
    login: () => {throw new Error('Loading')},
    logout: () => {throw new Error('Loading')},
    callback: () => {throw new Error('Loading')},
    currentUser: null
}

export const AuthProviderCallback: React.FC = () => {
    const [searchParams] = useSearchParams()
    const { providerId } = useParams()
    const authContext = useContext(AuthContext)
    const [callback, setCallback] = useState(true)
    const navigate = useNavigate()

    const callbackContext = useMemo(() => {
        const callbackContext: Record<string, string> = {}
        searchParams.forEach((value, key) => callbackContext[key] = value)
        return callbackContext
    }, [searchParams])


    let isErr = false
    if (callbackContext.error) {
        isErr = true
    }

    useEffect(() => {
        if (callback && !isErr && !authContext.isLoading) {
            setCallback(false)
            const provider = authContext.providers.filter(p => p.name === providerId)[0]
            authContext.callback(provider, callbackContext)
            .then(() => navigate('/'))
        }
    }, [
        authContext, callback, callbackContext, providerId, isErr, navigate
    ])

    if (!isErr) {
        return <>
        Loading...
        </>
    }

    // just bump back to home.
    // TODO: use 'load last url' here?
    // if (callbackContext.error === 'access_denied') {
    //     navigate('/')
    // }

    return <>
        {stringify(callbackContext)}
    </>
}

export const AuthProvider: React.FC<{children?: React.ReactNode}> = ({children}) => {
    const [auth, setAuth] = useState<AuthContextType>(loadingContext)
    useEffect(() => {
        if (auth.isLoading) {
            const logout = () => {
                localStorage.removeItem(localStorageKeys.user)
                Cookies.remove(jwtCookieName)
                setAuth(existing => {return {
                ...existing,
                currentUser: null,
            }})}
            const login = (provider: LoginProvider) => {
                //  not replace - don't want to lose our url history
                window.location.href = provider.authorizeUrl
            }
            const callback = (provider: LoginProvider, params: Record<string, string>) => {
                // load 'last url' and 'state hash' from Localstorage?
                return LoginCallback(provider.name, params).then(jwt => {
                    localStorage.setItem(localStorageKeys.user, jwt)
                    Cookies.set(jwtCookieName, jwt)
                    setAuth(existing => {
                        return {
                            ...existing,
                            currentUser: new JwtUser(jwt, logout),
                        }
                    })
                })
            }
            
            const jwtString = localStorage.getItem(localStorageKeys.user)
            let currentUser: AuthenticatedUser | null = null
            if (jwtString !== null && jwtString !== '') {
                currentUser = new JwtUser(jwtString, logout)
                Cookies.set(jwtCookieName, jwtString)
                // TOOD: verify & force a non logout if not valid
            }
            if (currentUser === null) {
                Cookies.remove(jwtCookieName)
            }

            LoginProviders().then(providers => {
                setAuth({
                    isLoading: false,
                    providers,
                    login,
                    logout,
                    callback,
                    currentUser,
                })
            })
        }
    }, [auth])

    return <>
        <AuthContext.Provider value={auth}>
            {children}
        </AuthContext.Provider>
    </>
}
