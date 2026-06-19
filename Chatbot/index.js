import { marked } from "marked"
import DOMPurify from 'dompurify'
import { renderNewMessage } from "./dom.js"


async function getAIResponse(userInput) {

    const sanitizedInput = DOMPurify.sanitize(userInput)

    renderNewMessage(sanitizedInput, "user")

    try {

        const res = await fetch('/api', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ userInput: sanitizedInput })
        })

        const data = await res.json()

        const html = marked.parse(data.message)

        const safeHtml = DOMPurify.sanitize(html)

        renderNewMessage(safeHtml, "assistant")

    } catch (err) {
        console.error(err)
        renderNewMessage("Something went wrong. Please try again.", "assistant")
        return
    }

}

document.getElementById("form").addEventListener("submit", async function (event) {
    event.preventDefault()
    const inputElement = document.getElementById("user-input")
    inputElement.focus()
    const formData = new FormData(event.target)
    const query = formData.get("user-input")
    event.target.reset()

    // function to run the chat completions cycle from frontend to backend back to frontend
    await getAIResponse(query)
})