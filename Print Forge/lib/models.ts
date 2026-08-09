import { getDBConnection } from '@/lib/db'

export async function getModels({ categorySlug, search, sort }:
    { categorySlug?: string, search?: string, sort?: string }) {
    const db = await getDBConnection()

    let sql = "SELECT * FROM models"

    const placeholders: string[] = []

    if (categorySlug) {
        sql += " WHERE category = ?"
        placeholders.push(categorySlug)
    }

    if (!categorySlug && search) {
        sql += " WHERE (name LIKE ? OR description LIKE ?)"
        placeholders.push(`%${search}%`, `%${search}%`)
    }

    if (categorySlug && search) {
        sql += " AND (name LIKE ? OR description LIKE ?)"
        placeholders.push(`%${search}%`, `%${search}%`)
    }

    if (sort) {
        if (sort === 'alpha') sql += " ORDER BY name ASC";
        if (sort === 'popular') sql += " ORDER BY likes DESC";
        if (sort === 'recent') sql += " ORDER BY dateAdded DESC";
    }

    try {
        return await db.all(sql, placeholders)
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