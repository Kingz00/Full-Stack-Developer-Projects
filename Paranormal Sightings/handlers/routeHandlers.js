import { getData } from "../utils/getData.js";
import { sendResponse } from "../utils/sendResponse.js";
import { parseJSONBody } from "../utils/parseJSONBody.js";
import { addNewSighting } from "../utils/addNewSighting.js";

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
        await addNewSighting(parsedBody)
        sendResponse(res, 201, 'application/json', JSON.stringify(parsedBody))
        // 201 - Resource Created Successfully

    } catch (err) {

        console.log(err)
        sendResponse(res, 400, 'application/json', JSON.stringify({ error: err }))
        // 400 - Bad Request Status code
    }
}