import 'dotenv/config'
import express from 'express'
import session from 'express-session'
import { productsRouter } from './routes/products.js'
import { authRouter } from './routes/auth.js'
import { meRouter } from './routes/me.js'
import { cartRouter } from './routes/cart.js'
import { initializeAppDatabase } from './db/init.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()
const PORT = process.env.PORT || 8000

if (!process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET is not configured.')
}

const secret = process.env.SESSION_SECRET
const isProduction = process.env.NODE_ENV === 'production'

app.use(express.json())

if (isProduction) {
  app.set('trust proxy', 1)
}

app.use(session({
  secret: secret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24
  }
}))

app.use(express.static('public'))

app.use('/api/products', productsRouter)

app.use('/api/auth/me', meRouter)

app.use('/api/auth', authRouter)

app.use('/api/cart', cartRouter)

app.use(errorHandler)

async function startServer() {
  try {
    await initializeAppDatabase()

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running at http://localhost:${PORT}`)
    })
  } catch (err) {
    console.error('Failed to initialize application:', err)
    process.exit(1)
  }
}

startServer()