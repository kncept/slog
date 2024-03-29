import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { JwtAuthClaims, LoginProvider } from '../../interface/Model'
import { Loader } from './loaders/loaders'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import * as jose from 'jose'
import Cookies from 'js-cookie'
import Loading from './components/Loading'

const useBrowserCrypto = false

export interface AuthContextType {
    isLoading(): boolean // INITIAL load
    verificationKeys(): Array<string>
    providers(): Array<LoginProvider>
    login(provider: LoginProvider): void // will probably trigger path reloads
    logout(): void
    callback(provider: LoginProvider, params: Record<string, string>): Promise<void> // needed for Oauth2 callbacks
    currentUser(): AuthenticatedUser | null
}
const emptyDefaultAuthType: AuthContextType = {
    isLoading: () => true,
    verificationKeys: () => [],
    providers: () => [],
    login: (provider: LoginProvider) => window.location.href = provider.authorizeUrl, // not replace - don't want to lose our url history
    logout: () => {},
    callback: () => {throw new Error('Loading')},
    currentUser: () => null
}

const AuthContext = createContext<AuthContextType>(emptyDefaultAuthType)
export default AuthContext

const jwtCookieName = 'jwt'
const localStorageKeys = {
    user: 'user', //stores the json user
}

export interface AuthenticatedUser {
    token(): string
    logout(): Promise<void>

    name(): string
    id(): string

    admin(): boolean 
}

class JwtUser implements AuthenticatedUser {
    jwt: string
    claims: JwtAuthClaims
    logoutFn: () => void
    constructor(jwt: string, claims: JwtAuthClaims, logoutFn: () => void) {
        this.jwt = jwt
        this.claims = claims
        this.logoutFn = logoutFn
    }
    token(): string {
        return this.jwt
    }
    async logout(): Promise<void> {
        return this.logoutFn()
    }

    name(): string {
        return this.claims.name
    }
    id(): string {
        return this.claims.sub
    }
    admin(): boolean {
        return this.claims.admin
    }
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
        if (callback && !isErr && !authContext.isLoading()) {
            setCallback(false)
            const provider = authContext.providers().filter(p => p.name === providerId)[0]
            authContext.callback(provider, callbackContext)
            .then(() => navigate('/'))
        }
    }, [
        authContext, callback, callbackContext, providerId, isErr, navigate
    ])

    if (!isErr) {
        return <Loading />
    }

    // just bump back to home.
    // TODO: use 'load last url' here?
    // if (callbackContext.error === 'access_denied') {
    //     navigate('/')
    // }

    return <></>
}


export const AuthProvider: React.FC<{children?: React.ReactNode}> = ({children}) => {
    const [auth, setAuth] = useState<AuthContextType>(emptyDefaultAuthType)
    
    useEffect(() => {
        if (auth.isLoading()) {
            Loader(auth.currentUser()).LoginProviders().then(async loginOptions => {
                loginOptions = loginOptions || {}

                const logout = () => {
                    localStorage.removeItem(localStorageKeys.user)
                    Cookies.remove(jwtCookieName)
                    Loader(null).LogoutCallback().then(() => {
                        setAuth(existing => {return {
                            ...existing,
                            currentUser: () => null,
                        }})
                    })
                }
                
                const callback = (provider: LoginProvider, params: Record<string, string>) => {
                    // load 'last url' and 'state hash' from Localstorage?
                    return Loader(auth.currentUser()).LoginCallback(provider.name, params).then(jwt => {
                        localStorage.setItem(localStorageKeys.user, jwt)
                        setCookie(jwt)
                        ValidJwtUser(jwt, loginOptions.verificationKeys!, logout).then(user => {
                            setAuth(existing => {return {
                                ...existing,
                                currentUser: () => user,
                            }})
                        })
                    })
                }
                
                
                let initialUser: AuthenticatedUser | null = null
                // dynamic load (and verify) of locally stored user
                const jwtString = localStorage.getItem(localStorageKeys.user) || ''
                if (jwtString !== '') initialUser = await ValidJwtUser(jwtString, loginOptions.verificationKeys, logout).then(currentUser =>{
                    if (currentUser !== null) {
                        setCookie(currentUser.token())
                    } else {
                        localStorage.removeItem(localStorageKeys.user)
                        setCookie(null)
                    }
                    return currentUser
                })
                setAuth(existing => {return {
                    ...existing,
                    isLoading: () => false,
                    verificationKeys: () => loginOptions.verificationKeys || [],
                    providers: () => loginOptions.providers || [],
                    logout,
                    callback,
                    currentUser: () => initialUser
                }})
            })
        }
    }, [auth])


    return <>
        <AuthContext.Provider value={auth}>
            {children}
        </AuthContext.Provider>
    </>
}

// ASYNC 
async function ValidJwtUser(jwtString: string, verificationKeys: Array<string>, logoutFn: () => void): Promise<AuthenticatedUser | null> {
    if (!useBrowserCrypto) return new JwtUser(jwtString, jose.decodeJwt(jwtString) as any as JwtAuthClaims, logoutFn)
    for(let i = 0; i < verificationKeys.length; i++) {
        try {
            // jose.createRemoteJWKSet()
            
            // TODO: get some crypto working in the browser

            // const key = new TextEncoder().encode(verificationKeys[i])
            // const key = verificationKeys[i] as any as jose.KeyLike
            const key = await crypto.subtle.importKey('spki', new TextEncoder().encode(verificationKeys[i]), 'rsa', true, ['verify'])
            const claims = await jose.jwtVerify(jwtString, key) as any as JwtAuthClaims
            // const claims = jose.jwtDecrypt(jwtString, key) as any as JwtAuthClaims

            return new JwtUser(jwtString, claims, logoutFn)
        } catch (err) {
            // console.log(err)
        }
    }
    return null
}

function setCookie(jwt: string | null) {
    if (jwt === null) {
        console.log('clearing login cookie')
        Cookies.remove(jwtCookieName)
    } else {
        console.log('setting login cookie')
        Cookies.set(jwtCookieName, jwt, {
            sameSite: 'None',
            secure: true,
        })
    }
}
// function getCookie(): string | undefined {
//     return Cookies.get('jwt')
// }
