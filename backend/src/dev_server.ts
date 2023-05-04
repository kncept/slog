import * as http from 'http'
import Router from './router'

const router: Router = new Router()

const server = http.createServer((req, res) => {
    router.route(req.method || "", req.url || "", req.read())
    .then((value: any) => {
        console.log("SUCCESS")
        console.log(value)
        res.writeHead(200)
        if (value != null && value != undefined) {
            res.write(JSON.stringify(value))
        }
        res.end()
    })
    .catch((err: any) => {
        console.log("ERROR")
        console.log(err)
        res.writeHead(500)
        if (err != null && err != undefined) {
            res.write(err)
        }
        res.end()
    })
})
server.listen(8080, "localhost", () => {
    console.log("server is running")
})
