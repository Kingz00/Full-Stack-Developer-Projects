import { getDBConnection } from '@/lib/db'

export async function getModels() {
    const db = await getDBConnection()

    try {
        return await db.all("SELECT * FROM models")
    } finally {
        await db.close()
    }
}