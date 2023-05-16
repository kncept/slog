// I must say, the Lambda V3 API and typescript offering from amazon is horrible
import { Post } from '../../interface/Model'
import * as luxon from 'luxon'
import Storage from './storage/storage'
import { randomUUID } from 'crypto'
import { parse, stringify} from '@supercharge/json'
import PathExtractor from './path-extractor'

export default class Router {
    storage: Storage
    constructor(storage: Storage){
        this.storage = storage
    }

    async route(method: string, path: string, requestBody: string): Promise<any> {
        console.log('router', {method, path, requestBody})

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
                    const data = parse(requestBody)
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
            const post = parse(requestBody) as Post
            this.storage.UpdateDraft(post)
        }

        return undefined
    }
}
