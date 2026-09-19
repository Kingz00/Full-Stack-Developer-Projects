import type Database from 'better-sqlite3';
import type { GameRun, RunStatus } from '../domain/gameRun/types.js';

export interface CreateGameRunInput {
    userId: number;
    selectedHeroId: number;
}

export class GameRunRepository {
    constructor(private readonly db: Database.Database) { }

    create(input: CreateGameRunInput): GameRun {
        const result = this.db
            .prepare(`
                        INSERT INTO game_runs (
                        user_id,
                        selected_hero_id
                        )
                        VALUES (?, ?)
                    `)
            .run(
                input.userId,
                input.selectedHeroId,
            );

        const gameRun = this.findById(Number(result.lastInsertRowid));

        if (!gameRun) {
            throw new Error('Failed to retrieve created game run.');
        }

        return gameRun;
    }

    findById(id: number): GameRun | null {
        const row = this.db
            .prepare(`
                    SELECT id, user_id, selected_hero_id, status, started_at, completed_at
                        FROM game_runs
                        WHERE id = ?
                `)
            .get(id);

        if (!row) {
            return null;
        }

        return this.toDomain(row);
    }

    findByIdForUser(id: number, userId: number): GameRun | null {
        const row = this.db
            .prepare(`
                    SELECT id, user_id, selected_hero_id, status, started_at, completed_at 
                        FROM game_runs
                        WHERE id = ? AND user_id = ?
                `)
            .get(id, userId);

        if (!row) {
            return null;
        }

        return this.toDomain(row);
    }

    updateStatus(id: number, status: RunStatus): GameRun | null {
        this.db
            .prepare(`
            UPDATE game_runs
            SET
            status = ?,
            completed_at = CASE
                WHEN ? = 'active' THEN NULL
                ELSE CURRENT_TIMESTAMP
            END
            WHERE id = ?
        `)
            .run(status, status, id);

        return this.findById(id);
    }

    private toDomain(row: unknown): GameRun {
        const gameRun = row as {
            id: number;
            user_id: number;
            selected_hero_id: number;
            status: RunStatus;
            started_at: string;
            completed_at: string | null;
        };

        return {
            id: gameRun.id,
            userId: gameRun.user_id,
            selectedHeroId: gameRun.selected_hero_id,
            status: gameRun.status,
            startedAt: gameRun.started_at,
            completedAt: gameRun.completed_at,
        };
    }
}