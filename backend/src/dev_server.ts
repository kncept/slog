import * as http from 'http'
import Router from './router'

const router: Router = new Router()


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
        router.route(method, req.url || "", req.read())
        .then((value: any) => {
            addCorsHeaders()
            res.writeHead(200)
            if (value != null && value != undefined) {
                res.write(JSON.stringify(value))
            }
            res.end()
        })
        .catch((err: any) => {
            console.log(err)
            res.writeHead(500)
            if (err != null && err != undefined) {
                res.write(err)
            }
            res.end()
        })
    }
})
server.listen(8080, "localhost", () => {
    console.log("dev backend is running")
})
