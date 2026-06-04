import { getDBConnection } from "../db/db.js"

export async function addToCart(req, res) {

    let { productId } = req.body

    productId = JSON.parse(productId)

    // can also convert the productId into a number using parseInt()
    // const productId = parseInt(req.body.productId, 10)

    // check if productId is a number and throw an error if it isn't
    if (isNaN(productId)) {
        return res.status(400).json({ error: 'Invalid product ID' })
    }

    // check if there is a valid user session id
    if (!req.session.userId) {
        return res.status(400).json({ error: 'Login in or register an account to add items to cart' })
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
        console.error(err)
    }
    finally {
        if (db) {
            await db.close()
        }
    }
}