import { getDBConnection } from "../db/db.js"

export async function addToCart(req, res, next) {

    let { productId } = req.body

    productId = JSON.parse(productId)

    // can also convert the productId into a number using parseInt()
    // const productId = parseInt(req.body.productId, 10)

    // check if productId is a number and throw an error if it isn't
    if (isNaN(productId)) {
        return res.status(400).json({ error: 'Invalid product ID' })
    }

    const db = await getDBConnection()

    try {

        const cartItem = await db.get(`
            SELECT * FROM cart_items WHERE product_id = ? AND user_id = ?
            `,
            [productId, req.session.userId])

        if (cartItem) {

            const quantity = cartItem.quantity + 1
            await db.run(`
                UPDATE cart_items SET quantity = ?
                WHERE product_id = ? AND user_id = ?
                `,
                [quantity, productId, req.session.userId])

            res.json({ message: 'Added to cart' })
        }
        else {

            await db.run(`
                INSERT INTO cart_items ( user_id, product_id)
                VALUES (?, ?)
                `,
                [req.session.userId, productId])

            res.json({ message: 'Added to cart' })
        }

    }
    catch (err) {
        next(err)
    }
    finally {
        if (db) {
            await db.close()
        }
    }
}

export async function getCartCount(req, res, next) {

    const userId = req.session.userId

    const db = await getDBConnection()

    try {

        const cartCount = await db.get(`
            SELECT SUM(quantity) AS totalItems FROM cart_items
            WHERE user_id = ?
            `,
            [userId])

        if (!cartCount.totalItems) {
            return res.json({ totalItems: 0 })
        }

        res.json({ totalItems: cartCount.totalItems })
    }
    catch (err) {
        next(err)
    }
    finally {
        if (db) {
            await db.close()
        }
    }
}

export async function getAll(req, res, next) {

    const db = await getDBConnection()

    try {

        const cartItems = await db.all(`
            SELECT C.id AS cartItemId, C.quantity, P.title, P.artist, P.price FROM cart_items C
            LEFT JOIN products P ON C.product_id = P.id
            WHERE C.user_id = ?
            `,
            [req.session.userId])

        if (!cartItems) {
            return res.json([])
        }

        res.json({ items: cartItems })
    }
    catch (err) {
        next(err)
    }
    finally {
        if (db) {
            await db.close()
        }
    }
}

export async function deleteItem(req, res, next) {

    if (req.params.itemId === 'all') {
        deleteAll(req, res)
        return
    }

    const itemId = parseInt(req.params.itemId)

    // if the item id is not a number send an error response
    if (isNaN(itemId)) {
        return res.status(400).json({ error: 'Invalid item ID' })
    }

    const db = await getDBConnection()

    try {

        // Get the item from the database
        const item = await db.get(`
            SELECT quantity FROM cart_items WHERE id = ? AND user_id = ?
            `,
            [itemId, req.session.userId])

        // check if the item exists and send an error response if it doesn't
        if (!item) {
            return res.status(400).json({ error: 'Item not found' })
        }

        // delete the item from the cart_items table
        await db.run(`
            DELETE FROM cart_items WHERE id = ? AND user_id = ?
            `,
            [itemId, req.session.userId])

        // Sends 204 (No Content) status code and closes the connection without a body
        res.sendStatus(204)
        // can also be sent with res.status(204).send()
    }
    catch (err) {
        next(err)
    }
    finally {
        if (db) {
            await db.close()
        }
    }
}

export async function deleteAll(req, res, next) {

    const userId = req.session.userId

    const db = await getDBConnection()

    try {

        await db.run(`
            DELETE FROM cart_items WHERE user_id = ?
            `,
            [userId])

        res.status(204).send()
    }
    catch (err) {
        next(err)
    }
    finally {
        if (db) {
            await db.close()
        }
    }
}