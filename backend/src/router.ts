// I must say, the Lambda V3 API and typescript offering from amazon is horrible
import { Post } from '../../interface/Model'
import * as luxon from 'luxon'
import Storage from './storage/storage'
import { randomUUID } from 'crypto'
import { parse } from '@supercharge/json'

export default class Router {
    storage: Storage
    constructor(storage: Storage){
        this.storage = storage
    }

    async route(method: string, path: string, requestBody: string): Promise<any> {
        console.log('method', method)
        console.log('path', path)
        console.log('requestBody', requestBody)

        if (path === null || path == undefined || path === "") {
            throw new Error("No path defined: " + path)
        }
        
        // slice leading slash if present
        if (path.startsWith("/")) {
            path = path.substring(1)
        }

        if (method === 'GET' && path.startsWith("post/")) {
            let id = path.substring(5)
            if (id === '') {
                return this.storage.ListPosts()
            } else {
                return this.storage.GetPost(id)
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

        if (method === 'POST' && path.startsWith('create-draft')) {
            return this.storage.ListDrafts()
            .then(async drafts => {
                if (drafts.length < 5) {
                    const data = parse(requestBody)
                    const now = luxon.DateTime.now().toISO() || ''
                    const draftPost: Post = {
                        content: [],
                        contributors: [], // TODO - need to extract identity somehow
                        created: now,
                        updated: now,
                        title: data.title,
                        id: randomUUID(),
                    }
                    await this.storage.SaveDraft(draftPost.id, draftPost)
                    return draftPost
                } else {
                    throw new Error('Maximum number of drafts reached')
                }
            })
        }

        if (method === 'GET' && path.startsWith("draft/")) {
            const id = path.substring(6)
            if (id === '') {
                return this.storage.ListDrafts()   
            } else {
                return this.storage.GetDraft(id)
            }
        }

        return undefined
    }
}