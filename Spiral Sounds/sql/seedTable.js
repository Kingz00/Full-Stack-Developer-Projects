import { vinyl } from "../data.js"

const seedProductsTable = async (db) => {

    try {

        await db.exec('BEGIN TRANSACTION')

        for (const { title, artist, price, image, year, genre, stock } of vinyl) {

            await db.run(`
                INSERT INTO products (title, artist, price, image, year, genre, stock)
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [title, artist, price, image, year, genre, stock]
            )

        }

        await db.exec('COMMIT')
        console.log('All records inserted successfully.')

    } catch (err) {

        await db.exec('ROLLBACK')
        console.error('Error inserting data:', err.message)

    } finally {

        await db.close()
        console.log('Database connection closed.')

    }
}

export { seedProductsTable }