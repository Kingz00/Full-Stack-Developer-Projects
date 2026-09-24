import db from './database.js';
import { heroSeedData } from './heroSeedData.js';

const seedHeroes = db.transaction(() => {
    const insertHero = db.prepare(`
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

seedHeroes();

console.log(`Seeded ${heroSeedData.length} heroes.`);