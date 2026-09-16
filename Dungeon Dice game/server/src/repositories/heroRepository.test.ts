import Database from 'better-sqlite3';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { createDatabase } from '../db/database.js';
import { HeroRepository } from './heroRepository.js';

describe('HeroRepository', () => {
    let db: Database.Database;
    let repository: HeroRepository;

    beforeEach(() => {
        db = createDatabase(':memory:');

        db.exec(`
                CREATE TABLE heroes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL UNIQUE,
                    description TEXT NOT NULL,
                    image_url TEXT NOT NULL,
                    health INTEGER NOT NULL CHECK (health > 0),
                    attack INTEGER NOT NULL CHECK (attack > 0),
                    defense INTEGER NOT NULL CHECK (defense >= 0),
                    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
                );
        `);

        repository = new HeroRepository(db);

        db.prepare(`
                INSERT INTO heroes (
                    name,
                    description,
                    image_url,
                    health,
                    attack,
                    defense
                )
                VALUES (?, ?, ?, ?, ?, ?)
                `)
            .run(
                'Test Hero',
                'A hero used for testing.',
                '/images/test-hero.png',
                100,
                10,
                5,
            );
    });

    afterEach(() => {
        db.close();
    });

    it('returns all heroes', () => {
        const heroes = repository.findAll();

        expect(heroes).toHaveLength(1);
        expect(heroes[0]).toEqual({
            id: 1,
            name: 'Test Hero',
            description: 'A hero used for testing.',
            imageUrl: '/images/test-hero.png',
            health: 100,
            attack: 10,
            defense: 5,
        });
    });

    it('returns a hero by id', () => {
        const hero = repository.findById(1);

        expect(hero).toEqual({
            id: 1,
            name: 'Test Hero',
            description: 'A hero used for testing.',
            imageUrl: '/images/test-hero.png',
            health: 100,
            attack: 10,
            defense: 5,
        });
    });

    it('returns null when the hero does not exist', () => {
        expect(repository.findById(999)).toBeNull();
    });
});