// I must say, the Lambda V3 API and typescript offering from amazon is horrible
import {Post} from '../../interface/Model'
import {DateTime} from 'luxon'

export default class Router {
    storage: any
    constructor(){

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

            const post: Post = {
                id,
                title: "Title " + Math.random(),
                contributors: [],
                content: [],
                created: DateTime.now().toISO() || "",
                updated: DateTime.now().toISO() || "",
            }
            return post
        }


        throw new Error("404 Not Found")
    }
}