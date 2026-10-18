export interface User {
    id: number;
    username: string;
    email: string | null;
    passwordHash: string;
    createdAt: string;
    emailVerifiedAt: string | null;
}