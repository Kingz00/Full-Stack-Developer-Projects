import { getDBConnection } from "@/lib/db";
import categories from "@/lib/data/categories.json"

const seedCategories = async () => {
    let db
    let insertCategories

    try {

        db = await getDBConnection()

        // Enable foreign key support
        await db.exec("PRAGMA foreign_keys = ON;");

        // Nothing to seed
        if (categories.length === 0) {
            console.log("No models found to seed.");
            return;
        }

        // Create table
        await db.exec(`
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            slug TEXT NOT NULL UNIQUE
        );
        `);

        // Prepare UPSERT statement
        insertCategories = await db.prepare(`
        INSERT INTO categories (
            name,
            slug
        )
        VALUES (?, ?)

        ON CONFLICT(slug)
        DO UPDATE SET
            name = excluded.name
        `);

        await db.exec("BEGIN IMMEDIATE TRANSACTION");

        let insertedCount = 0;

        for (const category of categories) {
            // Basic validation
            if (
                typeof category.name !== "string" ||
                typeof category.slug !== "string"
            ) {
                throw new Error(
                    `Invalid category data encountered for slug: ${category.slug ?? "Unknown"}`
                );
            }

            await insertCategories.run(
                category.name,
                category.slug
            );

            insertedCount++;
        }

        await db.exec("COMMIT");

        console.log(`✅ Successfully seeded ${insertedCount} categories.`);


    } catch (error) {
        if (db) {
            try {
                await db.exec("ROLLBACK");
            } catch {
                // Ignore rollback errors
            }
        }

        console.error("❌ Error seeding categories table:", error);
    } finally {
        if (insertCategories) {
            await insertCategories.finalize();
        }

        if (db) {
            await db.close();
        }
    }
};

seedCategories();