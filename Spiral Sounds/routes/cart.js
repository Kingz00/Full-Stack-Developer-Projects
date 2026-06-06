import express from 'express'
import { requireAuth } from '../middleware/requireAuth.js'
import { addToCart, getCartCount, getAll, deleteItem, deleteAll } from '../controllers/cartController.js'

export const cartRouter = express.Router()

cartRouter.post('/add', requireAuth, addToCart)
cartRouter.get('/cart-count', requireAuth, getCartCount)
cartRouter.get('/', requireAuth, getAll)
cartRouter.delete('/:itemId', requireAuth, deleteItem)
cartRouter.delete('/all', requireAuth, deleteAll)