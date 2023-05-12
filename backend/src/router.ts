// I must say, the Lambda V3 API and typescript offering from amazon is horrible
import {Post} from '../../interface/Model'
import {DateTime} from 'luxon'
import Storage from './storage/storage'

export default class Router {
    storage: Storage
    constructor(storage: Storage){
        this.storage = storage
    }

    async route(method: string, path: string, requestBody: any): Promise<any> {
        // console.log('method', method)
        // console.log('path', path)
        // console.log('requestBody', requestBody)

        if (path == null || path == undefined || path === "") {
            throw new Error("No path defined: " + path)
        }
        
        // slice leading slash if present
        if (path.startsWith("/")) {
            path = path.substring(1)
        }

        if (path.startsWith("post/")) {
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

        if (path.startsWith("draft/")) {
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