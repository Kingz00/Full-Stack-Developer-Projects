import Database from 'better-sqlite3';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { createDatabase } from '../db/database.js';
import { GameRunRepository } from './gameRunRepository.js';

describe('GameRunRepository', () => {
    let db: Database.Database;
    let repository: GameRunRepository;

    beforeEach(() => {
        db = createDatabase(':memory:');

        db.exec(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

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

      CREATE TABLE game_runs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        selected_hero_id INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'active'
          CHECK (status IN ('active', 'completed', 'abandoned')),
        started_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        completed_at TEXT,

        FOREIGN KEY (user_id)
          REFERENCES users(id)
          ON DELETE CASCADE,

        FOREIGN KEY (selected_hero_id)
          REFERENCES heroes(id)
      );

      CREATE INDEX idx_game_runs_user_id
      ON game_runs(user_id);
    `);

        db.prepare(`
      INSERT INTO users (
        username,
        password_hash
      )
      VALUES (?, ?)
    `).run(
            'testuser',
            'hashed-password',
        );

        db.prepare(`
      INSERT INTO users (
        username,
        password_hash
      )
      VALUES (?, ?)
    `).run(
            'otheruser',
            'hashed-password',
        );

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
    `).run(
            'Test Hero',
            'A hero used for testing.',
            '/images/test-hero.png',
            100,
            10,
            5,
        );

        repository = new GameRunRepository(db);
    });

    afterEach(() => {
        db.close();
    });

    it('creates a game run', () => {
        const gameRun = repository.create({
            userId: 1,
            selectedHeroId: 1,
        });

        expect(gameRun).toMatchObject({
            id: 1,
            userId: 1,
            selectedHeroId: 1,
            status: 'active',
            completedAt: null,
        });

        expect(gameRun.startedAt).toBeTruthy();
    });

    it('finds a game run by id', () => {
        const createdGameRun = repository.create({
            userId: 1,
            selectedHeroId: 1,
        });

        const gameRun = repository.findById(createdGameRun.id);

        expect(gameRun).toEqual(createdGameRun);
    });

    it('returns null when the game run does not exist', () => {
        expect(repository.findById(999)).toBeNull();
    });

    it('finds a game run belonging to a user', () => {
        const createdGameRun = repository.create({
            userId: 1,
            selectedHeroId: 1,
        });

        const gameRun = repository.findByIdForUser(
            createdGameRun.id,
            1,
        );

        expect(gameRun).toEqual(createdGameRun);
    });

    it('returns null when the game run belongs to another user', () => {
        const createdGameRun = repository.create({
            userId: 1,
            selectedHeroId: 1,
        });

        expect(
            repository.findByIdForUser(
                createdGameRun.id,
                2,
            ),
        ).toBeNull();
    });

    it('marks an active game run as completed', () => {
        const createdGameRun = repository.create({
            userId: 1,
            selectedHeroId: 1,
        });

        const gameRun = repository.updateStatus(
            createdGameRun.id,
            'completed',
        );

        expect(gameRun).toMatchObject({
            id: createdGameRun.id,
            status: 'completed',
        });

        expect(gameRun?.completedAt).toBeTruthy();
    });

    it('marks an active game run as abandoned', () => {
        const createdGameRun = repository.create({
            userId: 1,
            selectedHeroId: 1,
        });

        const gameRun = repository.updateStatus(
            createdGameRun.id,
            'abandoned',
        );

        expect(gameRun).toMatchObject({
            id: createdGameRun.id,
            status: 'abandoned',
        });

        expect(gameRun?.completedAt).toBeTruthy();
    });

    it('returns null when updating a nonexistent game run', () => {
        expect(
            repository.updateStatus(999, 'completed'),
        ).toBeNull();
    });
});