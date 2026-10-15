import path from 'node:path';
import type Database from 'better-sqlite3';

import db from './database.js';
import { heroSeedData } from './heroSeedData.js';

export function seedHeroes(database: Database.Database) {
    const seed = database.transaction(() => {
        const insertHero = database.prepare(`
            INSERT INTO heroes (
                id,
                name,
                description,
                image_url,
                health,
                attack,
                defense
            )
            VALUES (
                @id,
                @name,
                @description,
                @imageUrl,
                @health,
                @attack,
                @defense
            )
            ON CONFLICT(id) DO UPDATE SET
                name = excluded.name,
                description = excluded.description,
                image_url = excluded.image_url,
                health = excluded.health,
                attack = excluded.attack,
                defense = excluded.defense
        `);

        for (const hero of heroSeedData) {
            insertHero.run(hero);
        }
    });

    seed();
    console.log(`Seeded ${heroSeedData.length} heroes.`);
}


// Preserve the existing npm run db:seed command.
if (process.argv[1] &&
    path.resolve(process.argv[1]) === path.resolve(import.meta.filename)) {
    try {
        seedHeroes(db);
    } finally {
        db.close();
    }
}