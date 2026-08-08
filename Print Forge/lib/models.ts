import { getDBConnection } from '@/lib/db'

export async function getModels(search?: string, sort?: string) {
    const db = await getDBConnection()

    let sql = "SELECT * FROM models"

    const placeholders: string[] = []

    if (search) {
        sql += " WHERE (name LIKE ? OR description LIKE ?)"
        placeholders.push(`%${search}%`, `%${search}%`)
    }

    if (sort) {
        if (sort === 'alpha') sql += " ORDER BY name ASC";
        if (sort === 'popular') sql += " ORDER BY likes DESC"
        if (sort === 'recent') sql += " ORDER BY dateAdded DESC"
    }

    try {
        return await db.all(sql, placeholders)
    } finally {
        if (db) {
            await db.close()
        }
    }
}

export async function getModelsByCategorySlug(categorySlug: string) {
    const db = await getDBConnection()
    try {
        return await db.all(`SELECT * FROM models WHERE category=?`, [categorySlug])
    } finally {
        if (db) {
            await db.close()
        }
    }
}

export async function getModelById(id: string) {
    const db = await getDBConnection()

    const parsedId = parseInt(id, 10)

    try {
        return await db.get(`SELECT * FROM models WHERE id=?`, [parsedId])
    } finally {
        if (db) {
            await db.close()
        }
    }
}