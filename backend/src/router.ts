// I must say, the Lambda V3 API and typescript offering from amazon is horrible
import { Post } from '../../interface/Model'
import * as luxon from 'luxon'
import Storage from './storage/storage'
import { randomUUID } from 'crypto'
import { parse, stringify} from '@supercharge/json'
import PathExtractor from './path-extractor'
import { writeFileSync } from 'fs'

export default class Router {
    storage: Storage
    constructor(storage: Storage){
        this.storage = storage
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
                return this.storage.GetPost(id)
            } else {
                return this.storage.ListPosts()
            }

            // const post: Post = {
            //     id,
            //     title: "Title " + Math.random(),
            //     contributors: [],
            //     content: [],
            //     created: DateTime.now().toISO() || "",
            //     updated: DateTime.now().toISO() || "",
            // }
            // return post
        }

        if (method === 'POST' && extractor.current() === 'create-draft') {
            return this.storage.ListDrafts()
            .then(async drafts => {
                if (drafts.length < 5) {
                    const data = parse(requestBody!.toString()) // TODO: content-type this
                    console.log('parsing' + requestBody + ' to', data)
                    const now = luxon.DateTime.now().toISO() || ''
                    const draftPost: Post = {
                        content: [],
                        contributors: [], // TODO - need to extract identity somehow
                        created: now,
                        updated: now,
                        title: data.title,
                        id: randomUUID(),
                    }
                    await this.storage.CreateDraft(draftPost)
                    return draftPost
                } else {
                    throw new Error('Maximum number of drafts reached')
                }
            })
        }

        if (method === 'GET' && extractor.current() === 'draft') {
            if (extractor.hasMorePath()) {
                extractor = extractor.next()
                const id = extractor.current()
                return this.storage.GetDraft(id)
            } else {
                return this.storage.ListDrafts().then(posts => posts.sort((a, b) => {
                    return luxon.DateTime.fromISO(a.created).toMillis() - luxon.DateTime.fromISO(b.created).toMillis()
                })) 
            }
        }

        if (method === 'POST' && extractor.current() === 'draft') {
            const post = parse(requestBody!.toString()) as Post
            this.storage.UpdateDraft(post)
        }

        // well, this is bulky. need to fix this 
        if (method === 'POST' && extractor.current() === 'image') {
            if (extractor.hasMorePath()) {
                extractor = extractor.next()
                if (extractor.current() === "post" || extractor.current() === "draft") {
                    const type = extractor.current()
                    if (extractor.hasMorePath()) {
                        extractor = extractor.next()
                        const id = extractor.current()

                        const cdHeader = extractHeader(headers, 'content-disposition') || ''
                        console.log('write image: ', {type, id, cdHeader})
                        if (cdHeader.startsWith('file; filename=')) {
                            const filename = cdHeader.substring(15)
                            this.storage.AddDraftMedia(id, filename, requestBody!)
                            // await writeFileSync('/workspaces/super-simple-blog/.data/' + id + '__' + filename, requestBody!)
                            return true
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