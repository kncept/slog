// I must say, the Lambda V3 API and typescript offering from amazon is horrible
import { Post, PostMetadata } from '../../interface/Model'
import * as luxon from 'luxon'
import Storage from './storage/storage'
import { parse, stringify} from '@supercharge/json'
import KSUID from 'ksuid'
import * as mime from 'mime-types'
import { match } from 'node-match-path'

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
            const res = await this.storage.DraftStorage().ListPosts().then(sortPosts)
            return quickResponse(stringify(res))
        }
        if (params.matches && method === 'POST') {
            const post = parse(requestBody!.toString()) as Post
            await this.storage.DraftStorage().Save(post)
            return {
                statusCode: 204, // accepted, 'No Content'
            }
        }

        params = match('/draft/:postId', path)
        if (params.matches && method === 'GET') {
            const id = params!.params!.postId
            const res = await this.storage.DraftStorage().GetPost(id)
            return quickResponse(stringify(res))
        }

        params = match('/create-draft', path)
        if (params.matches && method == 'POST') {
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

        return {
            statusCode: 404,
        }
    }
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
