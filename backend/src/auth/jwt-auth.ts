import { JwtAuthClaims, LoginOptions, LoginProvider } from '../../../interface/Model'
import { KeyPair, KeySpec, simpleDecode, simpleEncode } from '../crypto/crypto-utils'
import jwt from 'jsonwebtoken'
import { parse } from '@supercharge/json'
import { LoginProvider as BackendLoginProvider } from '../../../orchestration/env-properties'
import fetch from 'isomorphic-fetch'
import { KeyName, KeyManager, KeyPairName } from '../crypto/keypair-manager'

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
    ParseAuth: (authorizationHeader: string | undefined, cookieHeader: string | undefined) => Promise<ParsedAuth>
    LoginOptions: () => Promise<LoginOptions>
    LoginCallback: (providerName: string, requestBody: Record<string, string>) => Promise<string> //JWT ... or null for failure?
    ValidKeys: () => Promise<Array<string>>

    // // using the 'user' key::
    EncodeUserId: (userId: string, version?: string | undefined) => Promise<string>
    DecodeUserId: (userId: string, version?: string | undefined) => Promise<string>
    
}

export class AsymetricJwtAuth implements JwtAuthenticator {
    keyManager: KeyManager

    cache: any = {}
    constructor(
        keyManager: KeyManager
    ){
        this.keyManager = keyManager
    }

    loginKeypair: () =>  Promise<KeyPair> = async () => {
        if (!this.cache[KeyPairName.login]) {
            this.cache[KeyPairName.login] = await this.keyManager.ReadKeyPair(KeyPairName.login)
        }
        return this.cache[KeyPairName.login]
    }
    userKey: (version: string | undefined ) => Promise<KeySpec> = async () => {
        // TODO - versionmanager this, and keep efficient caching
        if (!this.cache[KeyName.user]) {
            this.cache[KeyName.user] = await this.keyManager.ReadKey(KeyName.user)
        }
        return this.cache[KeyName.user] 
    }

    ParseAuth: (header: string | undefined, cookieHeader: string | undefined) => Promise<ParsedAuth> = async (authorizationHeader, cookieHeader) => {
        if (authorizationHeader !== undefined && authorizationHeader.startsWith('Bearer ')) {
            const jwtString = authorizationHeader.substring(7)
            return parseJwtString(jwtString, await this.loginKeypair())
        }
        if (cookieHeader) {
            const jwtString = getCookie('jwt', cookieHeader)
            if(jwtString) return parseJwtString(jwtString, await this.loginKeypair())
        }
        return unauthenticated
    }

    LoginOptions: () => Promise<LoginOptions> = async () => {
        const providers: Array<LoginProvider> = []

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
                    providers.push({
                        name: p.name,
                        authorizeUrl,
                    } as LoginProvider)
                }
            } else if (p.type === 'oidc') {
                throw new Error('OIDC with autoconfigure not yet supported')
            }
        })

        return {
            providers,
            verificationKeys: [(await this.loginKeypair()).publicKey]
        }
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
                        
                        const subject = await this.EncodeUserId(`${providerName}:${userDetails.id}`, undefined)
                        const privateKey = (await this.loginKeypair()).privateKey
                        const authToken = jwt.sign(
                            authenticatedUser,
                            privateKey,
                            {
                                algorithm: 'RS512',
                                issuer: 'slog',
                                expiresIn: '1d',
                                subject,
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

    ValidKeys: () => Promise<Array<string>> = async () => [(await this.loginKeypair()).publicKey]

    EncodeUserId: (userId: string, version: string | undefined) => Promise<string> = async (userId, version) => this.userKey(version).then(key => simpleEncode(key, userId, version))

    DecodeUserId: (encodedId: string, version: string | undefined) => Promise<string> = (encodedId, version) => this.userKey(version).then(key => simpleDecode(key, encodedId, version))

}

function parseJwtString(jwtString: string, keyPair: KeyPair): ParsedAuth {
    try {
        const claims = jwt.verify(jwtString, keyPair.publicKey, {
            algorithms: [
                // 'RS256',
                // 'RS384',
                'RS512',
            ],
            issuer: 'slog'
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

function getCookie(name: string, cookieHeader: string) : string | undefined{
    let matches = cookieHeader.match(new RegExp(
      "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
  }