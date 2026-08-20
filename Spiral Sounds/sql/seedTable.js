import { vinyl } from '../data.js'

export async function seedProductsTable(db) {
    try {
        await db.exec('BEGIN TRANSACTION')

        for (const { title, artist, price, image, year, genre, stock } of vinyl) {
            await db.run(
                `
                INSERT INTO products
                    (title, artist, price, image, year, genre, stock)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                `,
                [title, artist, price, image, year, genre, stock]
            )
        }

        await db.exec('COMMIT')

        console.log('Products seeded successfully.')
    } catch (err) {
        await db.exec('ROLLBACK')
        throw err
    }
}