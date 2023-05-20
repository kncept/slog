import * as http from 'http'
import Router from './router'
import * as path from 'path'
import { FilesystemStorage } from './storage/storage'
import { LocalFsOperations } from './storage/filesystem-storage'

const router: Router = new Router(new FilesystemStorage(path.join(__dirname, '..', '..', '.data'), new LocalFsOperations()))

const server = http.createServer((req, res) => {

    const addCorsHeaders = () => {
        const originHeader = req.headers.origin || "*"
        // console.log("origin header", originHeader)
        res.setHeader("Access-Control-Allow-Origin", originHeader) // * for dev
        // res.setHeader("Access-Control-Allow-Methods", ["OPTIONS", "GET", "POST"])
        res.setHeader("Access-Control-Allow-Methods", ["*"])
        res.setHeader("Access-Control-Allow-Headers", ["*"])
    }

    let method = req.method || ""
    method = method.toUpperCase()
    // console.log(method, req.url)

    if (method === "OPTIONS") {
        addCorsHeaders()
        res.writeHead(204) // 204 NO CONTENT
        res.end()
    } else if (method === 'POST') {
        // have to stream out the post data ...
        let body = Buffer.from([])
        // let body: string = ''
        req.on('data', data => {
            body = Buffer.concat([body, data])
            // body = body + data.toString()
        })
        req.on('end', async() => {
            respond(method, req.url || '', flattenHeaders(req.headers), body, res, addCorsHeaders)
        })
    } else if (method === 'GET') {
        respond(method, req.url || '', flattenHeaders(req.headers), undefined, res, addCorsHeaders)
    }
})

function flattenHeaders(headers: NodeJS.Dict<string | string[]>): Record<string, string> {
    const flat: Record<string, string> = {}
    Object.keys(headers).forEach(key => {
        const value = headers[key]
        if (Array.isArray(value)) {
            flat[key] = value[0]
        } else {
            flat[key] = value || ''
        }
    })
    return flat
}

function respond(method: string, path: string, headers: Record<string, string>, requestBody: Buffer | undefined, res: http.ServerResponse<http.IncomingMessage>, addCorsHeaders: () => void) {
    router.route(method, path, headers, requestBody)
    .then((value) => {
        addCorsHeaders()
        if(value.headers) {
            Object.keys(value.headers).forEach(key => res.setHeader(key, value.headers![key]))
        }
        res.writeHead(value.statusCode)
        if (value.body) res.write(value.body!)
        res.end()
    })
    .catch((err: Error) => {
        console.log(err)
        res.writeHead(500)
        if (err != null && err != undefined && err.message) {
            res.write(err.message)
        }
        res.end()
    })
}

server.listen(8080, "localhost", () => {
    console.log("dev backend is running")
})
