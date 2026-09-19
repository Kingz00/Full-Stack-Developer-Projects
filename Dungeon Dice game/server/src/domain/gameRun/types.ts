export type RunStatus = 'active' | 'completed' | 'abandoned';

export interface GameRun {
    id: number;
    userId: number;
    selectedHeroId: number;
    status: RunStatus;
    startedAt: string;
    completedAt: string | null;
}