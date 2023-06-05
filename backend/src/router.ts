// I must say, the Lambda V3 API and typescript offering from amazon is horrible
import { Identified, Post, PostMetadata, PostUpdatableFields } from '../../interface/Model'
import * as luxon from 'luxon'
import Storage from './storage/storage'
import { parse, stringify} from '@supercharge/json'
import KSUID from 'ksuid'
import * as mime from 'mime-types'
import { match } from 'node-match-path'

import { KeyPair } from './crypto/crypto-utils'
import { AsymetricJwtAuth, AuthResult, JwtAuthenticator } from './auth/jwt-auth'

export interface RouterResponse {
    statusCode: number
    headers?: Record<string, string>
    body?: Buffer | string | undefined
}

export default class Router {
    storage: Storage
    readyFlag: Promise<any>
    keyPair: Promise<KeyPair>

    auth: JwtAuthenticator

    constructor(storage: Storage, keyPair: Promise<KeyPair>){
        this.storage = storage
        this.readyFlag = storage.readyFlag
        this.keyPair = keyPair
    }

    async route(method: string, path: string, headers: Record<string, string | undefined>, requestBody: Buffer | undefined): Promise<RouterResponse> {
        if (path === null || path === undefined || path === "") {
            throw new Error("No path defined: " + path)
        }
        
        // TODO: fix multi headers for 'Cookie'
        if (this.auth === undefined) this.auth = new AsymetricJwtAuth(await this.keyPair)
        const parsedAuth = this.auth.ParseAuth(extractHeader(headers, 'Authorization'), extractHeader(headers, 'Cookie'))
        if (parsedAuth.result === AuthResult.invalid) return forbiddenResponse

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
            if (parsedAuth.result === AuthResult.unauthorized) return unauthorizedResponse
            if (!parsedAuth.claims?.admin) return forbiddenResponse
            const res = await this.storage.DraftStorage().ListPosts().then(sortPosts)
            return quickResponse(stringify(res))
        }

        params = match('/draft/:postId', path)
        if (params.matches && method === 'POST') {
            if (parsedAuth.result === AuthResult.unauthorized) return unauthorizedResponse
            if (!parsedAuth.claims?.admin) return forbiddenResponse
            const id = params!.params!.postId
            const post = parse(requestBody!.toString()) as PostUpdatableFields
            await this.storage.DraftStorage().GetPost(id)
            .then(async existing => {
                if (post.markdown) existing.markdown = post.markdown
                if (post.title) existing.title= post.title
                await this.storage.DraftStorage().Save(existing)    
            })
            return emptyResponse
        }

        params = match('/draft/:postId', path)
        if (params.matches && method === 'GET') {
            if (parsedAuth.result === AuthResult.unauthorized) return unauthorizedResponse
            if (!parsedAuth.claims?.admin) return forbiddenResponse
            const id = params!.params!.postId
            const res = await this.storage.DraftStorage().GetPost(id)
            return quickResponse(stringify(res))
        }
        if (params.matches && method === 'DELETE') {
            if (parsedAuth.result === AuthResult.unauthorized) return unauthorizedResponse
            if (!parsedAuth.claims?.admin) return forbiddenResponse
            const id = params!.params!.postId
            await this.storage.DraftStorage().DeletePost(id)
            return emptyResponse
        }

        params = match('/create-draft', path)
        if (params.matches && method == 'POST') {
            if (parsedAuth.result === AuthResult.unauthorized) return unauthorizedResponse
            if (!parsedAuth.claims?.admin) return forbiddenResponse
            const res = await this.storage.DraftStorage().ListPosts()
                .then(async drafts => {
                    if (drafts.length < 5) {
                        const data = parse(requestBody!.toString()) // TODO: content-type this
                        const now = luxon.DateTime.now().toMillis()
                        const postMeta: PostMetadata = {
                            attachments: [],
                            contributors: [
                                // parsedAuth.claims?.sub
                            ], // TODO: extract current logged in user
                            id: KSUID.randomSync().string,
                            title: data.title,
                            updatedTs: now,
                        }
                        await this.storage.DraftStorage().Save({...postMeta, markdown: ''})
                        return postMeta
                    } else {
                        throw new Error('Maximum number of drafts reached')
                    }
                })
                return quickResponse(stringify(res))
        }

        params = match('/publish-draft/:postId', path)
        if (params.matches && method == 'POST') {
            if (parsedAuth.result === AuthResult.unauthorized) return unauthorizedResponse
            if (!parsedAuth.claims?.admin) return forbiddenResponse
            const id = params!.params!.postId
            const newId = KSUID.randomSync().string
            await this.storage.DraftStorage().PublishDraft(id, newId)
            return quickResponse(stringify({
                id: newId
            } as Identified))
        }

        params = match('/image/:type/:postId', path)
        if (params.matches && method === 'POST' && params!.params!.type === 'draft') {
            if (parsedAuth.result === AuthResult.unauthorized) return unauthorizedResponse
            if (!parsedAuth.claims?.admin) return forbiddenResponse
            const id = params!.params!.postId
            const cdHeader = extractHeader(headers, 'content-disposition') || ''
            if (cdHeader.startsWith('file; filename=')) {
                const filename = cdHeader.substring(15)
                await this.storage.DraftStorage().AddMedia(id, filename, requestBody!)
                return emptyResponse
            }
        }

        params = match('/image/:type/:postId/:filename', path)
        if (params.matches && method === 'GET') {
            const id = params!.params!.postId
            const type = params!.params!.type
            const filename = params!.params!.filename
            if (type === 'post') return bufferResponse(await this.storage.PostStorage().GetMedia(id, filename), filename)
            if (type === 'draft') {
                if (parsedAuth.result === AuthResult.unauthorized) return unauthorizedResponse
                if (!parsedAuth.claims?.admin) return forbiddenResponse
                return bufferResponse(await this.storage.DraftStorage().GetMedia(id, filename), filename)
            }
        }

        params = match('/login/providers', path)
        if (params.matches && method === 'GET') {
            return quickResponse(stringify(this.auth.LoginOptions()))
        }
        params = match('/login/callback/:providerName', path)
        if (params.matches && method === 'POST') {
            const providerName = params!.params!.providerName
            return this.auth.LoginCallback(providerName, parse(requestBody!.toString()) as Record<string, string>)
            .then(jwt => {
                return {
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'application/jwt',
                    },
                    body: jwt,
                }
            })
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

const emptyResponse: RouterResponse = {
    statusCode: 204, // accepted, 'No Content'
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

function extractHeader(headers: Record<string, string | undefined>, headerName: string) : string | undefined{
    let value: string | undefined
    Object.keys(headers).forEach (key => {
        if (key.toLowerCase() === headerName.toLowerCase()) {
            value = headers[key]
        }
    })
    return value
}

function sortPosts(data: Array<PostMetadata>): Array<PostMetadata> {
    return data.sort((a: PostMetadata, b: PostMetadata) => b.updatedTs - a.updatedTs)
}
