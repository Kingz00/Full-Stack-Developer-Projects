import sanitizeHtml from 'sanitize-html'

export const parseJSONBody = async (req) => {

    let body = ''
    for await (const chunk of req) {
        body += chunk
    }

    try {

        const parsedBody = JSON.parse(body)
        const sanitizedText = sanitizeHtml(parsedBody.text, {
            allowedTags: ['b'],
            allowedAttributes: {}
        })
        const sanitizedTitle = sanitizeHtml(parsedBody.title)
        const sanitizedLocation = sanitizeHtml(parsedBody.location)
        parsedBody.text = sanitizedText
        parsedBody.title = sanitizedTitle
        parsedBody.location = sanitizedLocation
        return parsedBody

    } catch (err) {

        throw new Error(`Invalid JSON format: ${err}`);
    }
}