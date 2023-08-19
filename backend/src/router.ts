// I must say, the Lambda V3 API and typescript offering from amazon is horrible
import { Contributor, Identified, JwtAuthClaims, Post, PostMetadata, PostUpdatableFields } from '../../interface/Model'
import * as luxon from 'luxon'
import Storage, { updatePostIfRequired } from './storage/storage'
import { parse, stringify} from '@supercharge/json'
import KSUID from 'ksuid'
import * as mime from 'mime-types'
import { match } from 'node-match-path'

import { AsymetricJwtAuth, AuthResult, JwtAuthenticator } from './auth/jwt-auth'

export function frontendUrl(): string {
    let url = process.env.PUBLIC_URL || ''
    if (!url.endsWith('/')) url = url + '/'
    return url
  }

export function frontendUrlNoSlash() {
    return frontendUrl().substring(0, frontendUrl().length - 1)
}
export function corsHeaders(originHeader: string | undefined, allowedOrigins: string[]): Record<string, string[]> {
    const matchingOrigins = allowedOrigins.filter(origin => origin === originHeader)

    const multiValueHeaders: Record<string, string[]> = {}
    multiValueHeaders['Access-Control-Allow-Headers'] = [
        'Content-Type',
        'Content-Length',
        'Content-Disposition',
        'Authorization',
        'Accept'
    ]
    multiValueHeaders['Access-Control-Allow-Origin'] = matchingOrigins.length == 1 ? matchingOrigins : [frontendUrlNoSlash()] // browser will deny access
    multiValueHeaders['Vary'] = ['Origin']
    multiValueHeaders['Access-Control-Allow-Methods'] = ['OPTIONS','GET','POST','DELETE']
    multiValueHeaders['Access-Control-Allow-Credentials'] = ['true']
    return multiValueHeaders
}

export interface RouterResponse {
    statusCode: number
    headers?: Record<string, string>
    body?: Buffer | string | undefined
}

export default class Router {
    storage: Storage
    readyFlag: Promise<any>
    auth: JwtAuthenticator

    constructor(storage: Storage, ){
        this.storage = storage
        this.readyFlag = storage.readyFlag
    }

    async route(method: string, path: string, headers: Record<string, string | undefined>, requestBody: Buffer | undefined): Promise<RouterResponse> {
        try {
        if (path === null || path === undefined || path === "") {
            throw new Error("No path defined: " + path)
        }

        if (this.auth === undefined) this.auth = new AsymetricJwtAuth(this.storage.KeyManager())

        // TODO: fix multi headers for 'Cookie'
        const parsedAuth = await this.auth.ParseAuth(extractHeader(headers, 'Authorization'), extractHeader(headers, 'Cookie'))
        // console.log(`parsedAuth for ${method} ${path}`, parsedAuth)
        // TODO:
        // if (parsedAuth.result === AuthResult.invalid) {
            // delete auth tokens
        // }
        // if (parsedAuth.result === AuthResult.invalid) return forbiddenResponse

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
            const now = luxon.DateTime.now().toMillis()
            const id = params!.params!.postId
            const post = parse(requestBody!.toString()) as PostUpdatableFields
            await this.storage.DraftStorage().GetPost(id)
            .then(async existing => {
                if (post.markdown) existing.markdown = post.markdown
                if (post.title) existing.title= post.title
                existing.contributors = addContributor(existing.contributors, parsedAuth.claims!)
                existing.updatedTs = now
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
                            version: '', // add a version format stepper if required in the future
                            attachments: [],
                            contributors: addContributor([], parsedAuth.claims!),
                            id: KSUID.randomSync().string,
                            title: data.title,
                            updatedTs: now,
                        }
                        const post = updatePostIfRequired({...postMeta, markdown: ''})
                        await this.storage.DraftStorage().Save(post)
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
            console.log('about to upload image:: parsedAuth', parsedAuth)
            if (parsedAuth.result === AuthResult.unauthorized) return unauthorizedResponse
            if (!parsedAuth.claims?.admin) return forbiddenResponse
            const id = params!.params!.postId
            const cdHeader = extractHeader(headers, 'content-disposition') || ''
            console.log('content disposition header', cdHeader)
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

                // budget 404 - need to have better return types
                try {
                    return bufferResponse(await this.storage.DraftStorage().GetMedia(id, filename), filename)
                } catch (err) {
                    return {
                        statusCode: 404,
                        headers: {
                            'Content-Type': 'text/plain'
                        },
                        body: `NOT FOUND: ${method} ${path}`
                    }
                }
            }
        }

        params = match('/image/:type/:postId/:filename', path)
        if (params.matches && method === 'DELETE' && params!.params!.type === 'draft') {
            const id = params!.params!.postId
            // const type = params!.params!.type
            const filename = params!.params!.filename
            await this.storage.DraftStorage().RemoveMedia(id, filename)
            return emptyResponse
        }


        params = match('/login/providers', path)
        if (params.matches && method === 'GET') {
            return quickResponse(stringify(await this.auth.LoginOptions()))
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
        } catch (err) {
            return {
                statusCode: 500,
                headers: {
                    'Content-Type': 'text/plain'
                },
                body: stringify(err)
            }
        }
    }
}

const addContributor = (existing: Array<Contributor>, auth: JwtAuthClaims): Array<Contributor> => {
    for(let i = 0; i < existing.length; i++) {
        if (existing[i].id === auth.sub) {
            existing[i].name = auth.name,
            existing[i].email = auth.email
            return existing
        }
    }
    existing.push({
        id: auth.sub,
        name: auth.name,
        email: auth.email,
    })
    return existing
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
