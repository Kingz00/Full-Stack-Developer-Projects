import path from 'node:path';

export function resolveDatabasePath(configuredPath: string | undefined = process.env.DATABASE_PATH): string {
    const databasePath = configuredPath?.trim();

    if (!databasePath) {
        throw new Error('DATABASE_PATH must be configured.');
    }

    return path.resolve(process.cwd(), databasePath);
}
