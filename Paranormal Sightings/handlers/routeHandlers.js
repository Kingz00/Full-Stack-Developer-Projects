import { getData } from "../utils/getData.js";
import { sendResponse } from "../utils/sendResponse.js";
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