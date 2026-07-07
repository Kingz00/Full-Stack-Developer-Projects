import path from "node:path"
import fs from "node:fs/promises"
import { sendResponse } from "./sendResponse.js"
import { getContentType } from "./getContentType.js"

const serveStatic = async (req, res, dir) => {

    const publicDir = path.join(dir, "public")
    const filePath = path.join(publicDir, req.url === '/' ? "index.html" : req.url)
    const errorPath = path.join(publicDir, "404.html")

    // Content Type
    const ext = path.extname(filePath)
    const contentType = getContentType(ext)

    try {

        const content = await fs.readFile(filePath)
        sendResponse(res, 200, contentType, content)

    } catch (err) {
        console.error(err)
        if (err.code === 'ENOENT') {
            const errorPage = await fs.readFile(errorPath);
            sendResponse(res, 404, contentType, errorPage);
        } else {
            sendResponse(res, 500, contentType, `<html><h1>${err.code} <br/>Internal Server Error</h1></html>`);
        }
    }
}

export { serveStatic }