import { getDBConnection } from "../db/db.js"
import { AppError } from "../middleware/errorHandler.js"

export async function createOrder(req, res, next) {
    const db = await getDBConnection()
    const userId = req.session.userId

    try {
        // Get the user's current cart
        const cartItems = await db.all(`
            SELECT
                C.product_id,
                C.quantity,
                P.title,
                P.price,
                P.stock
            FROM cart_items C
            JOIN products P ON C.product_id = P.id
            WHERE C.user_id = ?
        `,
            [userId]
        )

        if (cartItems.length === 0) {
            return res.status(400).json({
                error: 'Cart is empty'
            })
        }

        await db.run('BEGIN TRANSACTION')

        let total = 0

        for (const item of cartItems) {
            // Verify that the requested quantity is still available
            if (item.quantity > item.stock) {
                throw new AppError(
                    `Insufficient stock for ${item.title}`,
                    409
                )
            }

            total += item.price * item.quantity
        }

        // Create the order
        const order = await db.run(`
            INSERT INTO orders (user_id, total)
            VALUES (?, ?)
        `,
            [userId, total]
        )

        // Create order items and decrease inventory
        for (const item of cartItems) {
            await db.run(`
                INSERT INTO order_items (
                    order_id,
                    product_id,
                    quantity,
                    price
                )
                VALUES (?, ?, ?, ?)
            `,
                [
                    order.lastID,
                    item.product_id,
                    item.quantity,
                    item.price
                ]
            )

            const result = await db.run(`
                UPDATE products
                SET stock = stock - ?
                WHERE id = ?
                AND stock >= ?
            `,
                [
                    item.quantity,
                    item.product_id,
                    item.quantity
                ]
            )

            if (result.changes !== 1) {
                throw new AppError(
                    `Insufficient stock for ${item.title}`,
                    409
                )
            }
        }

        // Remove the purchased items from the cart
        await db.run(`
            DELETE FROM cart_items
            WHERE user_id = ?
        `,
            [userId]
        )

        await db.run('COMMIT')

        res.status(201).json({
            message: 'Order created successfully',
            orderId: order.lastID,
            total
        })
    }
    catch (err) {
        try {
            await db.run('ROLLBACK')
        }
        catch (rollbackError) {
            console.error('Rollback failed:', rollbackError)
        }

        next(err)
    }
    finally {
        if (db) {
            await db.close()
        }
    }
}