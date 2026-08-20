import { getDBConnection, initializeDatabase } from './db.js'
import { seedProductsTable } from '../sql/seedTable.js'

export async function initializeAppDatabase() {
    const db = await getDBConnection()

    try {
        await initializeDatabase(db)

        const { count } = await db.get(
            'SELECT COUNT(*) AS count FROM products'
        )

        if (count === 0) {
            await seedProductsTable(db)
        }
    } finally {
        await db.close()
    }
}