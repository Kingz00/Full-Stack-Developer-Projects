import { getDBConnection } from '@/lib/db'

type ModelsType = {
    categorySlug?: string,
    search?: string,
    sort?: string,
    modelsPerPage: number,
    page: number
}

export async function getModels({ categorySlug, search, sort, modelsPerPage, page }: ModelsType) {
    const db = await getDBConnection()

    let sql = "SELECT * FROM models"

    const placeholders: (string | number)[] = []

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

    if (page && modelsPerPage) {
        const offset = (page - 1) * modelsPerPage
        sql += " LIMIT ? OFFSET ?"
        placeholders.push(modelsPerPage, offset)
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

export async function getModelCount({ search, categorySlug }
    : { search?: string, categorySlug?: string }) {
    const db = await getDBConnection()

    let sql = "SELECT COUNT(*) AS count FROM models"
    const placeholders: string[] = []


    if (search || categorySlug) {
        const where = []
        if (search) {
            where.push("(name LIKE ? OR description LIKE ?)")
            placeholders.push(`%${search}%`, `%${search}%`)
        }
        if (categorySlug) {
            where.push("category = ?")
            placeholders.push(categorySlug)
        }

        sql += ` WHERE ${where.join(" AND ")}`
    }

    try {
        const result = await db.get(sql, placeholders)
        return result.count
    } finally {
        if (db) {
            await db.close()
        }
    }
}