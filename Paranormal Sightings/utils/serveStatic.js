import path from 'node:path';
import fs from 'node:fs/promises';
import { sendResponse } from './sendResponse.js';
import { getContentType } from './getContentType.js';

export const serveStatic = async (req, res, dir) => {
    const publicDir = path.join(dir, 'public');
    const filepath = path.join(publicDir, req.url === '/' ? 'index.html' : req.url);
    const errorPath = path.join(publicDir, '404.html');
    const ext = path.extname(filepath);
    const contentType = getContentType(ext);


    // const filepath = path.join(publicDir, 'index.html');
    // console.log(filepath);

    try {

        const content = await fs.readFile(filepath);
        sendResponse(res, 200, contentType, content);
    } catch (error) {
        // console.log('Error serving static file:', error);

        if (error.code === 'ENOENT') {
            const errorPage = await fs.readFile(errorPath);
            sendResponse(res, 404, contentType, errorPage);
        } else {
            sendResponse(res, 500, contentType, `<html><h1>${error.code} <br/>Internal Server Error</h1></html>`);
        }
    }
}