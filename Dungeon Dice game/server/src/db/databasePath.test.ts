import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { resolveDatabasePath } from './databasePath.js';

afterEach(() => {
    vi.unstubAllEnvs();
});

describe('resolveDatabasePath', () => {
    it('rejects a missing database path', () => {
        vi.stubEnv('DATABASE_PATH', undefined);

        expect(() => resolveDatabasePath())
            .toThrow('DATABASE_PATH must be configured.');
    });

    it('rejects an empty or whitespace-only database path', () => {
        expect(() => resolveDatabasePath(''))
            .toThrow('DATABASE_PATH must be configured.');

        expect(() => resolveDatabasePath('   '))
            .toThrow('DATABASE_PATH must be configured.');
    });

    it('resolves a relative path from the working directory', () => {
        expect(resolveDatabasePath('data/dungeon-dice.db'))
            .toBe(path.resolve(process.cwd(), 'data/dungeon-dice.db'));
    });

    it('preserves an absolute database path', () => {
        const absolutePath = path.resolve(
            process.cwd(),
            'custom',
            'dungeon-dice.db',
        );

        expect(resolveDatabasePath(absolutePath)).toBe(absolutePath);
    });
});