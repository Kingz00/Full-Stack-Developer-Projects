import type Database from 'better-sqlite3';
import type { Hero } from '../domain/hero/types.js';

export class HeroRepository {
    constructor(private readonly db: Database.Database) { }

    findAll(): Hero[] {
        const rows = this.db
            .prepare(`
                    SELECT id, name, description, image_url, health, attack, defense
                        FROM heroes
                        ORDER BY id
                `)
            .all();

        return rows.map((row) => this.toDomain(row));
    }

    findById(id: number): Hero | null {
        const row = this.db
            .prepare(`
                    SELECT id, name, description, image_url, health, attack, defense
                        FROM heroes
                        WHERE id = ?
                `)
            .get(id);

        if (!row) {
            return null;
        }

        return this.toDomain(row);
    }

    private toDomain(row: unknown): Hero {
        const hero = row as {
            id: number;
            name: string;
            description: string;
            image_url: string;
            health: number;
            attack: number;
            defense: number;
        };

        return {
            id: hero.id,
            name: hero.name,
            description: hero.description,
            imageUrl: hero.image_url,
            health: hero.health,
            attack: hero.attack,
            defense: hero.defense,
        };
    }
}