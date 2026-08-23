import express from 'express'
import { requireAuth } from '../middleware/requireAuth.js'
import { createOrder, getOrders } from '../controllers/orderController.js'

export const orderRouter = express.Router()

orderRouter.post("/", requireAuth, createOrder)

orderRouter.get("/", requireAuth, getOrders)