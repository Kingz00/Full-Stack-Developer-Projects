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
        run_number INTEGER NOT NULL,
        selected_hero_id INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'active'
          CHECK (status IN ('active', 'completed', 'abandoned')),
        started_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        completed_at TEXT,

        FOREIGN KEY (user_id)
          REFERENCES users(id)
          ON DELETE CASCADE,

        FOREIGN KEY (selected_hero_id)
          REFERENCES heroes(id),

        UNIQUE (user_id, run_number)
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
            runNumber: 1,
            userId: 1,
            selectedHeroId: 1,
            status: 'active',
            completedAt: null,
        });

        expect(gameRun.startedAt).toBeTruthy();
    });

    it('assigns run number 1 to a user\'s first run', () => {
        const gameRun = repository.create({
            userId: 1,
            selectedHeroId: 1,
        });

        expect(gameRun.runNumber).toBe(1);
    });

    it('increments run numbers for the same user', () => {
        const firstRun = repository.create({
            userId: 1,
            selectedHeroId: 1,
        });

        const secondRun = repository.create({
            userId: 1,
            selectedHeroId: 1,
        });

        expect(firstRun.runNumber).toBe(1);
        expect(secondRun.runNumber).toBe(2);
    });

    it('starts run numbering at 1 for each user', () => {
        const userOneRun = repository.create({
            userId: 1,
            selectedHeroId: 1,
        });

        const userTwoRun = repository.create({
            userId: 2,
            selectedHeroId: 1,
        });

        expect(userOneRun.runNumber).toBe(1);
        expect(userTwoRun.runNumber).toBe(1);
    });

    it('does not reuse a run number after a run ends', () => {
        const firstRun = repository.create({
            userId: 1,
            selectedHeroId: 1,
        });

        repository.updateStatus(firstRun.id, 'completed');

        const secondRun = repository.create({
            userId: 1,
            selectedHeroId: 1,
        });

        expect(secondRun.runNumber).toBe(2);
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

    it('finds the active game run for a user', () => {
        const createdGameRun = repository.create({
            userId: 1,
            selectedHeroId: 1,
        });

        expect(
            repository.findActiveByUserId(1),
        ).toEqual(createdGameRun);
    });

    it('returns null when a user has no active game run', () => {
        const createdGameRun = repository.create({
            userId: 1,
            selectedHeroId: 1,
        });

        repository.updateStatus(
            createdGameRun.id,
            'completed',
        );

        expect(
            repository.findActiveByUserId(1),
        ).toBeNull();
    });

    it('does not return another user\'s active game run', () => {
        const userOneRun = repository.create({
            userId: 1,
            selectedHeroId: 1,
        });

        const userTwoRun = repository.create({
            userId: 2,
            selectedHeroId: 1,
        });

        expect(
            repository.findActiveByUserId(1),
        ).toEqual(userOneRun);

        expect(
            repository.findActiveByUserId(2),
        ).toEqual(userTwoRun);
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

    it('returns null when updating a completed game run', () => {
        const createdGameRun = repository.create({
            userId: 1,
            selectedHeroId: 1,
        });

        const completedGameRun = repository.updateStatus(
            createdGameRun.id,
            'completed',
        );

        expect(completedGameRun?.status).toBe('completed');

        expect(
            repository.updateStatus(
                createdGameRun.id,
                'abandoned',
            ),
        ).toBeNull();

        const persistedRun = repository.findById(
            createdGameRun.id,
        );

        expect(persistedRun).toMatchObject({
            status: 'completed',
        });
    });

    it('returns null when updating an abandoned game run', () => {
        const createdGameRun = repository.create({
            userId: 1,
            selectedHeroId: 1,
        });

        const abandonedGameRun = repository.updateStatus(
            createdGameRun.id,
            'abandoned',
        );

        expect(abandonedGameRun?.status).toBe('abandoned');

        expect(
            repository.updateStatus(
                createdGameRun.id,
                'completed',
            ),
        ).toBeNull();

        const persistedRun = repository.findById(
            createdGameRun.id,
        );

        expect(persistedRun).toMatchObject({
            status: 'abandoned',
        });
    });

    it('returns null when updating a nonexistent game run', () => {
        expect(
            repository.updateStatus(999, 'completed'),
        ).toBeNull();
    });
});