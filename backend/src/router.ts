// I must say, the Lambda V3 API and typescript offering from amazon is horrible
import { Post, PostMetadata } from '../../interface/Model'
import * as luxon from 'luxon'
import Storage from './storage/storage'
import { parse, stringify} from '@supercharge/json'
import PathExtractor from './path-extractor'
import KSUID from 'ksuid'

export default class Router {
    storage: Storage
    readyFlag: Promise<any>
    constructor(storage: Storage){
        this.storage = storage
        this.readyFlag = storage.readyFlag
    }

    async route(method: string, path: string, headers: Record<string, string>, requestBody: Buffer | undefined): Promise<any> {
        if (path === null || path == undefined || path === "") {
            throw new Error("No path defined: " + path)
        }
        let extractor = new PathExtractor(path)
        
        if (method === 'GET' && extractor.current() === 'post') {
            if (extractor.hasMorePath()) {
                extractor = extractor.next()
                const id = extractor.current()
                return this.storage.PostStorage().GetPost(id)
            } else {
                return this.storage.PostStorage().ListPosts().then(sortPosts)
            }
        }

        if (method === 'POST' && extractor.current() === 'create-draft') {
            return this.storage.DraftStorage().ListPosts()
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
        }

        if (method === 'GET' && extractor.current() === 'draft') {
            if (extractor.hasMorePath()) {
                extractor = extractor.next()
                const id = extractor.current()
                return this.storage.DraftStorage().GetPost(id)
            } else {
                return this.storage.DraftStorage().ListPosts().then(sortPosts)
            }
        }

        if (method === 'POST' && extractor.current() === 'draft') {
            const post = parse(requestBody!.toString()) as Post
            await this.storage.DraftStorage().Save(post)
            return true
        }

        // well, this is bulky. need to fix this 
        if (extractor.current() === 'image') {
            if (extractor.hasMorePath()) {
                extractor = extractor.next()
                if (extractor.current() === "post" || extractor.current() === "draft") {
                    const type = extractor.current()
                    if (extractor.hasMorePath()) {
                        extractor = extractor.next()
                        const id = extractor.current()


                        if(method === 'POST' && type == 'draft') {
                            const cdHeader = extractHeader(headers, 'content-disposition') || ''
                            console.log('write image: ', {type, id, cdHeader})
                            if (cdHeader.startsWith('file; filename=')) {
                                const filename = cdHeader.substring(15)
                                this.storage.DraftStorage().AddMedia(id, filename, requestBody!)
                                // await writeFileSync('/workspaces/super-simple-blog/.data/' + id + '__' + filename, requestBody!)
                                return true
                            }
                        } else if (method === 'GET') {
                            if (extractor.hasMorePath()) {
                                extractor = extractor.next()
                                const filename = extractor.current()
                                // gotta set response headers. sigh
                                if (type === 'post') return this.storage.PostStorage().GetMedia(id, filename)
                                if (type === 'draft') return this.storage.DraftStorage().GetMedia(id, filename)
                            }
                        }
                        
                    }
                }
            }
        }
        return undefined
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

// N.B. this is parsable by the fromSQL
function formatTodaysDate() {
    const date = luxon.DateTime.now()
    return `${date.year}-${date.month}-${date.day}`
}