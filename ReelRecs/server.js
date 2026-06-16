import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { handleUserQuery } from './handleUserQuery.js'
import { huggingFace } from './config.js'

const PORT = 3001

const app = express()

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(origin => origin.trim()).filter(Boolean)

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}))

app.use(express.json())

// Use Hugging Face to make the response conversational
const chatMessages = [{
    role: 'system',
    content: `You are an enthusiastic movie expert who loves recommending movies to people. You will be given two pieces of information - some context about movies and a question. Your main job is to formulate a short answer to the question using the provided context. If the answer is not given in the context, find the answer in the conversation history if possible. If you are unsure and cannot find the answer, say, "Sorry, I don't know the answer." Please do not make up the answer. Always speak as if you were chatting to a friend.`
}];

async function getChatCompletion(context, userQuery) {

    chatMessages.push({
        role: 'user',
        content: `Context: ${context} \n Question: ${userQuery}`
    })

    const aiResponse = await huggingFace.chat.completions.create({
        model: "openai/gpt-oss-120b:groq",
        messages: chatMessages
    })

    return aiResponse
}

app.post('/api', async (req, res) => {
    const { userInput } = req.body

    try {

        const context = await handleUserQuery(userInput, 'match_movies_sample')

        const response = await getChatCompletion(context, userInput)

        // Check if the model explicitly refused to answer (Safety/Content Filters)
        if (response.choices[0]?.message?.refusal) {
            throw new Error(`Model refused to respond: ${response.choices[0].message.refusal}`);
        }

        // Check for empty choices or empty text payload
        if (!response.choices || response.choices.length === 0 || !response.choices[0]?.message?.content) {
            throw new Error('API returned an empty completion response.');
        }

        chatMessages.push({
            role: 'assistant',
            content: response.choices[0].message.content
        })

        res.json({ content: response.choices[0].message.content })
    } catch (err) {

        // Both OpenAI API errors AND your manually thrown errors land here
        console.error(`Execution halted: ${err.message}`)
    }
})

app.listen(PORT, (error) => {
    if (error) {
        console.error("Failed to start server:", error.message)
        return process.exit(1)
    }
    console.log('Server listening on port:', PORT)
})