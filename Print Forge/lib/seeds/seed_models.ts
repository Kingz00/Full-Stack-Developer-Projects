import { getDBConnection } from "@/lib/db";
import models from "@/lib/data/models.json";

const seedModels = async () => {
    let db;
    let insertModel;

    try {
        db = await getDBConnection();

        // Enable foreign key support
        await db.exec("PRAGMA foreign_keys = ON;");

        // Nothing to seed
        if (models.length === 0) {
            console.log("No models found to seed.");
            return;
        }

        // Create table
        await db.exec(`
        CREATE TABLE IF NOT EXISTS models (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            likes INTEGER NOT NULL DEFAULT 0 CHECK(likes >= 0),
            image TEXT NOT NULL,
            category TEXT NOT NULL CHECK(category <> ''),
            dateAdded TEXT NOT NULL
        );
        `);

        // Prepare UPSERT statement
        insertModel = await db.prepare(`
        INSERT INTO models (
            id,
            name,
            description,
            likes,
            image,
            category,
            dateAdded
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)

        ON CONFLICT(id)
        DO UPDATE SET
            name = excluded.name,
            description = excluded.description,
            likes = excluded.likes,
            image = excluded.image,
            category = excluded.category,
            dateAdded = excluded.dateAdded;
        `);

        await db.exec("BEGIN IMMEDIATE TRANSACTION");

        let insertedCount = 0;

        for (const model of models) {
            // Basic validation
            if (
                typeof model.id !== "number" ||
                typeof model.name !== "string" ||
                typeof model.description !== "string" ||
                typeof model.likes !== "number" ||
                typeof model.image !== "string" ||
                typeof model.category !== "string" ||
                typeof model.dateAdded !== "string"
            ) {
                throw new Error(
                    `Invalid model data encountered for ID: ${model.id ?? "Unknown"}`
                );
            }

            await insertModel.run(
                model.id,
                model.name,
                model.description,
                model.likes,
                model.image,
                model.category,
                model.dateAdded
            );

            insertedCount++;
        }

        await db.exec("COMMIT");

        console.log(`✅ Successfully seeded ${insertedCount} models.`);
    } catch (error) {
        if (db) {
            try {
                await db.exec("ROLLBACK");
            } catch {
                // Ignore rollback errors
            }
        }

        console.error("❌ Error seeding models table:", error);
    } finally {
        if (insertModel) {
            await insertModel.finalize();
        }

        if (db) {
            await db.close();
        }
    }
};

seedModels();