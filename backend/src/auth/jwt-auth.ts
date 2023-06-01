import { JwtAuthClaims, LoginProvider } from '../../../interface/Model'
import { KeyPair } from '../crypto-utils'
import jwt from 'jsonwebtoken'
import { parse } from '@supercharge/json'
import { LoginProvider as BackendLoginProvider } from '../../../orchestration/env-properties'
import fetch from 'isomorphic-fetch'

const logonProviders = parse(process.env.LOGIN_PROVIDERS!) as Array<BackendLoginProvider>
const frontendUrl = process.env.PUBLIC_URL!
const adminUser = process.env.ADMIN_USER || ''

type JwtAuthClaimsToSend = Omit<JwtAuthClaims, 'iat' | 'iss' | 'sub'>

export enum AuthResult {
    authorized = 'authorized',
    unauthorized = 'unauthorized', // eg: 401
    invalid = 'invalid', // eg: 403
}

export interface ParsedAuth {
    result: AuthResult
    claims: JwtAuthClaims | undefined
}

const unauthenticated: ParsedAuth = {
    result: AuthResult.unauthorized,
    claims: undefined
}
const invalid: ParsedAuth = {
    result: AuthResult.invalid,
    claims: undefined
}

export interface JwtAuthenticator {
    ParseAuth: (header: string | undefined) => ParsedAuth
    LoginProviders: () => Array<LoginProvider>
    LoginCallback: (providerName: string, requestBody: Record<string, string>) => Promise<string> //JWT ... or null for failure?
}

export class AsymetricJwtAuth implements JwtAuthenticator {
    keyPair: KeyPair
    constructor(
        keyPair: KeyPair
    ){
        this.keyPair = keyPair
    }

    ParseAuth: (header: string | undefined) => ParsedAuth = (header) => {
        if (header === undefined) return unauthenticated
        if (!header.startsWith('Bearer ')) return unauthenticated

        let authJwt = header.substring(7)
        try {
            const claims = jwt.verify(authJwt, this.keyPair.publicKey, {
                algorithms: [
                    // 'RS256',
                    // 'RS384',
                    'RS512',
                ],
                issuer: 'super-simple-blog'
            }) as any as JwtAuthClaims
            return {
                result: AuthResult.authorized,
                claims,
            }
        } catch (err) {
            const anyErr = err as any
            //anyErr.name === 'JsonWebTokenError'
            if (anyErr.message === 'invalid signature') {
                return invalid
            }

            // return forbiddenResponse
            return invalid
        }
    }

    LoginProviders: () => Array<LoginProvider> = () => {
        const availableProviders: Array<LoginProvider> = []

        logonProviders.forEach(p => {
            if (p.type === 'oauth2') {
                const urlParams = new URLSearchParams({
                    client_id: p.clientId,
                    redirect_uri: `${frontendUrl}callback/${p.name}`,
                    scope: p.claims,
                    state: 'none',

                })
                const authorizeUrl = `${p.authorizeUrl}?${urlParams.toString()}`

                if (p.type === 'oauth2') {
                    availableProviders.push({
                        name: p.name,
                        authorizeUrl,
                    } as LoginProvider)
                }
            } else if (p.type === 'oidc') {
                throw new Error('OIDC with autoconfigure not yet supported')
            }
        })

        return availableProviders
    }

    LoginCallback: (providerName: string, requestBody: Record<string, string>) => Promise<string> = async (providerName, requestBody) => {
        for(let i = 0; i < logonProviders.length; i++) {
            const p = logonProviders[i]
            if (p.name === providerName) {
                if (p.type === 'oauth2') {
                    // const params = parse(requestBody!.toString()) as Record<string, string>
                    const urlParams = new URLSearchParams({
                        client_id: p.clientId,
                        client_secret: p.clientSecret,
                        redirect_uri: `${frontendUrl}callback/${p.name}`,
                        code: requestBody.code,
                    })

                    const oauthToken = await fetch(p.accessTokenUrl, {
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json',
                        },
                        body: urlParams,
                    }).then((res: any) => res.json())

                    if (!oauthToken.error && oauthToken.access_token) {

                        // TODO: make this generic... or dictionary ify this (and params) for streamlined definitions
                        const userDetails = await fetch(p.userDetailsUrl, {
                            method: 'GET',
                            headers: {
                                'Accept': '*/*', // 'application/vnd.github+json',
                                'Authorization': 'Bearer ' + oauthToken.access_token,

                            }
                        }).then((res: any) => res.json())
                        // console.log(p.name + ' userDetails', userDetails)

                        let admin = false

                        // assumed common in 'user details endpoint' responses:
                        // email name login id

                        if (adminUser.includes('@')) {
                            admin = adminUser === `${providerName}:${userDetails.email}`
                        } else {
                            admin = adminUser === `${providerName}:${userDetails.login}`
                        }

                        // jwt.verify(authToken, 'private-key')
                        // const iat = Date.now() // for iat

                        // TODO: move to a Signed JWT with claims for 'email' and 'name' and 'admin'
                        const authenticatedUser: JwtAuthClaimsToSend = {
                            // authToken,
                            email: userDetails.email || '',
                            name: userDetails.name || userDetails.login,
                            admin,
                            tok: oauthToken.access_token
                        }

                        const authToken = jwt.sign(
                            authenticatedUser,
                            this.keyPair.privateKey,
                            {
                                algorithm: 'RS512',
                                issuer: 'super-simple-blog',
                                expiresIn: '1d',
                                subject:`${providerName}:${userDetails.id}`,
                            })
                            return authToken
                    }
                } else if (p.type === 'oidc') {
                    throw new Error('OIDC with autoconfigure not yet supported')
                }
            }
        }
        throw new Error('Unknown Auth Provider: ' + providerName)
    }

}