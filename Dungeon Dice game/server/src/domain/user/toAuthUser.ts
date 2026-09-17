import type { AuthUser } from '../auth/types.js';
import type { User } from './types.js';

export function toAuthUser(user: User): AuthUser {
    return {
        id: user.id,
        username: user.username,
        createdAt: user.createdAt
    };
}