// I must say, the Lambda V3 API and typescript offering from amazon is horrible
import { JwtAuthClaims, LoginProvider, Post, PostMetadata } from '../../interface/Model'
import * as luxon from 'luxon'
import Storage from './storage/storage'
import { parse, stringify} from '@supercharge/json'
import KSUID from 'ksuid'
import * as mime from 'mime-types'
import { match } from 'node-match-path'
import { LoginProvider as BackendLoginProvider } from '../../orchestration/env-properties'
import fetch from 'isomorphic-fetch'
import jwt from 'jsonwebtoken'
import { currentKeyPair } from './crypto-utils'

const logonProviders = parse(process.env.LOGIN_PROVIDERS!) as Array<BackendLoginProvider>
const frontendUrl = process.env.PUBLIC_URL!
const backendUrl = process.env.REACT_APP_API_ENDPOINT!
const adminUser = process.env.ADMIN_USER || ''

const keyPair = currentKeyPair()

type JwtAuthClaimsToSend = Omit<JwtAuthClaims, 'iat' | 'iss' | 'sub'>

export interface RouterResponse {
    statusCode: number
    headers?: Record<string, string>
    body?: Buffer | string | undefined
}

export default class Router {
    storage: Storage
    readyFlag: Promise<any>
    constructor(storage: Storage){
        this.storage = storage
        this.readyFlag = storage.readyFlag
    }

    async route(method: string, path: string, headers: Record<string, string>, requestBody: Buffer | undefined): Promise<RouterResponse> {
        if (path === null || path === undefined || path === "") {
            throw new Error("No path defined: " + path)
        }

        let requestorIsAuthorized = false
        let requestorIsAdmin = false
        if ((extractHeader(headers, 'Authorization') || '').startsWith('Bearer ')) {
            let authJwt = extractHeader(headers, 'Authorization')!.substring(7)
            try {
                const claims = jwt.verify(authJwt, (await keyPair).publicKey, {
                    algorithms: [
                        // 'RS256',
                        // 'RS384',
                        'RS512',
                    ],
                    issuer: 'super-simple-blog'
                }) as any as JwtAuthClaimsToSend
                requestorIsAuthorized = true
                if (claims.admin) {
                    requestorIsAdmin = true
                }
            } catch (err) {
                const anyErr = err as any
                //anyErr.name === 'JsonWebTokenError'
                if (anyErr.message === 'invalid signature') {
                    return forbiddenResponse
                }
            }
        }

        let params = match('/post/', path)
        if (params.matches && method === 'GET') {
            const res = await this.storage.PostStorage().ListPosts().then(sortPosts)
            return quickResponse(stringify(res))
        }

        params = match('/post/:postId', path)
        if (params.matches && method === 'GET') {
            const id = params!.params!.postId
            const res = await this.storage.PostStorage().GetPost(id)
            return quickResponse(stringify(res))
        }

        params = match('/draft/', path)
        if (params.matches && method === 'GET') {
            if (!requestorIsAuthorized) return unauthorizedResponse
            if (!requestorIsAdmin) return forbiddenResponse
            const res = await this.storage.DraftStorage().ListPosts().then(sortPosts)
            return quickResponse(stringify(res))
        }
        if (params.matches && method === 'POST') {
            if (!requestorIsAuthorized) return unauthorizedResponse
            if (!requestorIsAdmin) return forbiddenResponse
            const post = parse(requestBody!.toString()) as Post
            await this.storage.DraftStorage().Save(post)
            return {
                statusCode: 204, // accepted, 'No Content'
            }
        }

        params = match('/draft/:postId', path)
        if (params.matches && method === 'GET') {
            if (!requestorIsAuthorized) return unauthorizedResponse
            if (!requestorIsAdmin) return forbiddenResponse
            const id = params!.params!.postId
            const res = await this.storage.DraftStorage().GetPost(id)
            return quickResponse(stringify(res))
        }

        params = match('/create-draft', path)
        if (params.matches && method == 'POST') {
            if (!requestorIsAuthorized) return unauthorizedResponse
            if (!requestorIsAdmin) return forbiddenResponse
            const res = await this.storage.DraftStorage().ListPosts()
                .then(async drafts => {
                    if (drafts.length < 5) {
                        const data = parse(requestBody!.toString()) // TODO: content-type this
                        const now = luxon.DateTime.now().toMillis()
                        const postMeta: PostMetadata = {
                            attachments: [],
                            contributors: [], // TODO: extract current logged in user
                            id: KSUID.randomSync().string,
                            title: data.title,
                            updatedTs: luxon.DateTime.utc().toMillis(),
                        }
                        await this.storage.DraftStorage().Save({...postMeta, markdown: ''})
                        return postMeta
                    } else {
                        throw new Error('Maximum number of drafts reached')
                    }
                })
                return quickResponse(stringify(res))
        }

        params = match('/image/:type/:postId', path)
        if (params.matches && method === 'POST' && params!.params!.type === 'draft') {
            if (!requestorIsAuthorized) return unauthorizedResponse
            if (!requestorIsAdmin) return forbiddenResponse
            const id = params!.params!.postId
            const cdHeader = extractHeader(headers, 'content-disposition') || ''
            if (cdHeader.startsWith('file; filename=')) {
                const filename = cdHeader.substring(15)
                await this.storage.DraftStorage().AddMedia(id, filename, requestBody!)
                return {
                    statusCode: 204, // accepted, 'No Content'
                }
            }
        }

        params = match('/image/:type/:postId/:filename', path)
        if (params.matches && method === 'GET') {
            const id = params!.params!.postId
            const type = params!.params!.type
            const filename = params!.params!.filename
            if (type === 'post') return bufferResponse(await this.storage.PostStorage().GetMedia(id, filename), filename)
            if (type === 'draft') return bufferResponse(await this.storage.DraftStorage().GetMedia(id, filename), filename)
        }

        params = match('/login/providers', path)
        if (params.matches && method === 'GET') {
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
            return quickResponse(stringify(availableProviders))
        }

        params = match('/login/callback/:providerId', path)
        if (params.matches && method === 'POST') {
            const providerId = params!.params!.providerId
            for(let i = 0; i < logonProviders.length; i++) {
                const p = logonProviders[i]
                if (p.name === providerId) {
                    if (p.type === 'oauth2') {
                        const params = parse(requestBody!.toString()) as Record<string, string>
                        const urlParams = new URLSearchParams({
                            client_id: p.clientId,
                            client_secret: p.clientSecret,
                            redirect_uri: `${frontendUrl}callback/${p.name}`,
                            code: params.code,
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

                            if (adminUser.includes("@")) {
                                admin = adminUser === `${providerId}:${userDetails.email}`
                            } else {
                                admin = adminUser === `${providerId}:${userDetails.login}`
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
                                (await keyPair).privateKey,
                                {
                                    algorithm: 'RS512',
                                    issuer: 'super-simple-blog',
                                    expiresIn: '1d',
                                    subject:`${providerId}:${userDetails.id}`,
                                })
                            return {
                                statusCode: 200,
                                headers: {
                                    'Content-Type': 'application/jwt',
                                },
                                body: authToken,
                            }

                        }
                    } else if (p.type === 'oidc') {
                        throw new Error('OIDC with autoconfigure not yet supported')
                    }
                }
            }
        }

        return {
            statusCode: 404,
            headers: {
                'Content-Type': 'text/plain'
            },
            body: `NOT FOUND: ${method} ${path}`
        }
    }
}

// forbidden, go and authorize
const unauthorizedResponse: RouterResponse = {
    statusCode: 401,
}

// forbidden, auth was provided (ie: reauth)
const forbiddenResponse: RouterResponse = {
    statusCode: 403,
}

function quickResponse(jsonResponse: string): RouterResponse {
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json'
        },
        body: jsonResponse
    }
}

function bufferResponse(body: Buffer, filename: string): RouterResponse {
    return {
        statusCode: 200,
        headers: {
            'Content-Type': mime.lookup(filename.toLowerCase()) || 'application/octet-stream'
        },
        body
    }
}

function extractHeader(headers: Record<string, string>, headerName: string) : string | undefined{
    let value: string | undefined
    Object.keys(headers).forEach (key => {
        if (key.toLowerCase() === headerName.toLowerCase()) {
            value = headers[key]
        }
    })
    return value
}

function sortPosts(data: Array<PostMetadata>): Array<PostMetadata> {
    return data.sort((a: PostMetadata, b: PostMetadata) => a.updatedTs - b.updatedTs)
}
