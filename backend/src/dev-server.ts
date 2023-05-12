import * as http from 'http'
import Router from './router'
import path = require('path')
import FilesystemStorage from './storage/filesystem-storage'

const router: Router = new Router(new FilesystemStorage(path.join(__dirname, '..', '..', '.data')))


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
    } else {

        // have to stream out the post data
        let body: string = ''
        if (method === 'POST') {
            req.on('data', data => {
                body = body + data.toString()
            })
        }

        router.route(method, req.url || "", body)
        .then((value: any) => {
            addCorsHeaders()
            if (value === undefined) {
                res.writeHead(404)
            } else {
                res.writeHead(200)
                if (value != null) {
                    res.write(JSON.stringify(value))
                }
            }
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
})
server.listen(8080, "localhost", () => {
    console.log("dev backend is running")
})
