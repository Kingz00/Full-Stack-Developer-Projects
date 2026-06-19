import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { agent } from './aiResponse.js'

const PORT = 3002

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

app.post('/api', async (req, res) => {

    const { userInput } = req.body

    try {

        const responseText = await agent(userInput)

        res.json({ message: responseText })

    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Something went wrong on the server" })
    }
})

app.listen(PORT, (error) => {
    if (error) {
        console.error("Failed to start server:", error.message)
        return process.exit(1)
    }
    console.log('Server listening on port:', PORT)
})