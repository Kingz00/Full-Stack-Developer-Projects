import { getDBConnection } from "../db/db.js";


export async function getCurrentUser(req, res, next) {

    const db = await getDBConnection()

    try {

        if (!req.session.userId) {
            return res.json({ isLoggedIn: false })
        }

        const userName = await db.get(`
            SELECT name FROM users WHERE id = ?
            `,
            [req.session.userId])

        res.json({ isLoggedIn: true, name: userName.name })

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