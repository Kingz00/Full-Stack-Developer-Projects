import Category from "@/app/3d-models/categories/[categoryName]/page";
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

const getCategoryBySlug = async (categorySlug: string) => {
    const db = await getDBConnection()

    try {

        return await db.get("SELECT name FROM categories WHERE slug=?", [categorySlug])
    } finally {
        if (db) {
            await db.close()
        }
    }
}

export { getCategories, getCategoryBySlug }