import 'dotenv/config'
import OpenAI from "openai"
import { getCurrentWeather, getLocation, functions } from "./tools.js"


const huggingFace = new OpenAI({
    apiKey: process.env.HF_TOKEN,
    baseURL: process.env.AI_URL
})

const availableFunctions = {
    getCurrentWeather,
    getLocation
}

const messages = [
    {
        role: "system",
        content: `
            You are a helpful AI agent. Transform technical data into engaging, 
            conversational responses, but only include the normal information a 
            regular person might want unless they explicitly ask for more. Provide 
            highly specific answers based on the information you're given. Prefer 
            to gather information with the tools provided to you rather than 
            giving basic, generic answers. Your response should look like a chat message from a friend.
            `
    },
]

async function agent(query) {

    messages.push({ role: "user", content: query })

    const MAX_ITERATIONS = 10

    for (let i = 0; i < MAX_ITERATIONS; i++) {
        // console.log(`Iteration #${i + 1}`)

        const response = await huggingFace.chat.completions.create({
            model: "openai/gpt-oss-120b:groq",
            messages: messages,
            tools: functions
        })

        const responseMessage = response.choices[0].message

        messages.push(responseMessage)

        // console.log(responseMessage, '\n', response.choices[0].message.tool_calls)

        const finishReason = response.choices[0].finish_reason

        if (finishReason === 'tool_calls') {

            const toolCalls = response.choices[0].message.tool_calls

            for (const toolCall of toolCalls) {
                const functionName = toolCall.function.name
                const functionArgs = JSON.parse(toolCall.function.arguments)
                const functionToCall = availableFunctions[functionName]
                const functionResponse = await functionToCall(functionArgs)
                // console.log(functionResponse)

                messages.push({
                    tool_call_id: toolCall.id,
                    role: 'tool',
                    name: functionName,
                    content: functionResponse
                })
            }

        } else if (finishReason === 'stop') {

            const aiResponse = response.choices[0].message.content;
            // console.log("AGENT ENDING", "\n", aiResponse)
            messages.push({
                role: 'assistant',
                content: aiResponse
            })
            return aiResponse
        }
    }
}

export { agent }
