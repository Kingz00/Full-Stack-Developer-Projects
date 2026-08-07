import { getDBConnection } from "@/lib/db";

const getCategories = async () => {
    const db = await getDBConnection()

    try {

        return await db.all("SELECT * FROM categories")
    } finally {
        if (db) {
            await db.close()
        }
    }
}

export { getCategories }