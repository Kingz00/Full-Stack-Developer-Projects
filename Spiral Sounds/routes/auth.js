import { registerUser, loginUser, logoutUser } from "../controllers/authController.js"
import { requireAuth } from "../middleware/requireAuth.js"
import express from 'express'

export const authRouter = express.Router()

authRouter.post('/register', registerUser)
authRouter.post('/login', loginUser)
authRouter.post('/logout', requireAuth, logoutUser)