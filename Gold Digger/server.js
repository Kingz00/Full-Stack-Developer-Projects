import http from 'node:http'
import { serveStatic } from './utils/serveStatic.js'

const PORT = 8001

const __dirname = import.meta.dirname

const server = http.createServer((req, res) => {

    // Serve Static pages
    if (!req.url.startsWith("/api")) {
        serveStatic(req, res, __dirname)
    }
})

server.listen(PORT, () => console.log("Server running on  port:", PORT))