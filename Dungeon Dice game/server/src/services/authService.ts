import bcrypt from 'bcrypt';

import type { Credentials } from '../domain/auth/types.js';
import type { User } from '../domain/user/types.js';
import { AppError } from '../errors/AppError.js';
import { UserRepository } from '../repositories/userRepository.js';

const SALT_ROUNDS = 12;

export class AuthService {
    constructor(
        private readonly userRepository: UserRepository,
    ) { }

    async register(credentials: Credentials): Promise<User> {
        const existingUser = this.userRepository.findByUsername(credentials.username);

        if (existingUser) {
            throw new AppError(409, 'Username already exists.');
        }

        const passwordHash = await bcrypt.hash(credentials.password, SALT_ROUNDS);

        return this.userRepository.create({
            username: credentials.username,
            passwordHash
        });
    }

    async login(credentials: Credentials): Promise<User> {
        const user = this.userRepository.findByUsername(credentials.username);

        if (!user) {
            throw new AppError(401, 'Invalid username or password.');
        }

        const passwordMatches = await bcrypt.compare(
            credentials.password,
            user.passwordHash
        );

        if (!passwordMatches) {
            throw new AppError(401, 'Invalid username or password.');
        }

        return user;
    }
}