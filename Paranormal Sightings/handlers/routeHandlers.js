import { getData } from "../utils/getData.js";
import { sendResponse } from "../utils/sendResponse.js";
import { parseJSONBody } from "../utils/parseJSONBody.js";
import { addNewSighting } from "../utils/addNewSighting.js";
import { sightingEvent } from "../events/sightingEvents.js";
import { stories } from "../data/stories.js";
import sanitizeHtml from 'sanitize-html'

// handleGet

export const handleGet = async (res) => {

    try {

        const data = await getData()
        const stringifiedData = JSON.stringify(data)
        sendResponse(res, 200, 'application/json', stringifiedData)
    } catch (err) {

        console.log(err)
    }
}

// handlePost

export const handlePost = async (req, res) => {

    try {

        const parsedBody = await parseJSONBody(req)
        const cleanBody = Object.fromEntries(
            Object.entries(parsedBody).map(([key, value]) => {
                return [key, sanitizeData(value)]
            })
        )
        await addNewSighting(cleanBody)
        sendResponse(res, 201, 'application/json', JSON.stringify(parsedBody))
        // 201 - Resource Created Successfully

        sightingEvent.emit('sighting-added', parsedBody)

    } catch (err) {

        console.log(err)
        sendResponse(res, 400, 'application/json', JSON.stringify({ error: err }))
        // 400 - Bad Request Status code
    }
}

// handleNews

export const handleNews = async (req, res) => {

    res.statusCode = 200
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    setInterval(() => {

        let randomIndex = Math.floor(Math.random() * stories.length)

        res.write(`data: ${JSON.stringify({
            event: 'breaking-news',
            story: stories[randomIndex]
        })}\n\n`)

    }, 3000)
}

// sanitize data
const sanitizeData = (text) => {
    const clean = sanitizeHtml(text, {
        allowedTags: ['b'],
        allowedAttributes: {}
    })
    return clean
}