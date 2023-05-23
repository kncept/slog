import React, { createContext, useContext, useEffect, useState } from "react"
import { LoginProvider } from "../../interface/Model"
import { LoginCallback, LoginProviders } from "./loaders"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"


const AuthContext = createContext<AuthContextType>(undefined as any as AuthContextType)
export default AuthContext

export interface AuthContextType {
    isLoading: boolean // INITIAL load

    providers: Array<LoginProvider> // will error if called whilst loading
    login(provider: LoginProvider): void // will probably trigger path reloads
    logout(): void
    callback(provider: LoginProvider, params: Record<string, string>): Promise<void> // needed for Oauth2 callbacks
    currentUser: AuthUserType | null
}

export interface AuthUserType {
    name: string // display name
    email: string
    providedBy: string
    isAdmin: boolean
    authToken: string
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

    const callbackContext: Record<string, string> = {}
    searchParams.forEach((value, key) => callbackContext[key] = value)

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
        authContext, callback, callbackContext, providerId
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
        {JSON.stringify(callbackContext)}
    </>
}

export const AuthProvider: React.FC<{children?: React.ReactNode}> = ({children}) => {

    // TODO: Load auth providers from local storage (and refresh)

    // TODO: Load user from local storage. 

    const [auth, setAuth] = useState<AuthContextType>(loadingContext)

    useEffect(() => {
        if (auth.isLoading) {
            LoginProviders().then(providers => setAuth({
                isLoading: false,
                providers,
                login: (provider: LoginProvider) => {
                    //  not replace - don't want to lose our url history
                    window.location.href = provider.authorizeUrl
                },
                logout: () => {
                    setAuth(existing => {
                        return {
                            ...existing,
                            currentUser: null
                        }
                    })
                },
                callback: (provider: LoginProvider, params: Record<string, string>) => {
                    // load 'last url' and 'state hash' from Localstorage?
                    return LoginCallback(provider.name, params).then(tokenResponse => {
                        setAuth(existing => {
                            return {
                                ...existing,
                                currentUser: {
                                    email: '',
                                    isAdmin: true,
                                    name: 'dunno',
                                    providedBy: provider.name,
                                    authToken: tokenResponse,
                                }
                            }
                        })
                    })
                },
                currentUser: null
            }))
        }
    }, [auth])

    return <>
        <AuthContext.Provider value={auth}>
            {children}
        </AuthContext.Provider>
    </>
}



// export interface AuthContext {
//     isLoading(): boolean

//     providers(): Array<LoginProvider> // will error if called whilst loading
//     login(provider: LoginProvider): void // will probably trigger path reloads
//     onCallback(provider: LoginProvider): void // needed for Oauth2 callbacks
  
//     current(): {
//       provider: LoginProvider | undefined, // undefined whilst loading
//       user: any // TODO: need to be able to verify 'admin' privileges.
//     }
// }

// export const AuthContext = createContext<AuthContext | undefined>(undefined)

// export class AuthObjectClass implements AuthContext {
//     constructor(){}
//     isLoading(): boolean {
//         return true
//     }
//     providers(): LoginProvider[] {
//         throw new Error('No providers loaded. Please respect isLoading()')
//     }
//     login(provider: LoginProvider): void {
//     }
//     onCallback(provider: LoginProvider): void {
//     }
//     current(): { provider: LoginProvider | undefined; user: any } {
//         return {
//             provider: undefined,
//             user: null,
//         }
//     }
// }


// export default function createAuthContext(providers: Array<LoginProvider> | undefined): AuthContext {
//     return {
//         providers,
//         login: (provider => {
//             console.log('do login')
//         }),
//         onCallback: (provider => {

//         }),
//         current: {
//             provider: undefined,
//             user: null
//         }
//     }
// }