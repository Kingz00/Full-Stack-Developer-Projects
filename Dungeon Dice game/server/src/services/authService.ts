import bcrypt from 'bcrypt';

import type { Credentials, RegistrationInput } from '../domain/auth/types.js';
import type { User } from '../domain/user/types.js';
import { AppError } from '../errors/AppError.js';
import { UserRepository } from '../repositories/userRepository.js';

const SALT_ROUNDS = 12;

export class AuthService {
    constructor(
        private readonly userRepository: UserRepository,
    ) { }

    async register(input: RegistrationInput): Promise<User> {
        const email = input.email.trim().toLowerCase();

        const existingUser = this.userRepository.findByUsername(
            input.username,
        );

        if (existingUser) {
            throw new AppError(409, 'Username already exists.');
        }

        if (this.userRepository.findByEmail(email)) {
            throw new AppError(409, 'Email address already exists.');
        }

        const passwordHash = await bcrypt.hash(
            input.password,
            SALT_ROUNDS
        );

        try {
            return this.userRepository.create({
                username: input.username,
                email,
                passwordHash,
            });
        } catch (error) {
            // The database index also protects against concurrent
            // registrations using the same email address.
            if (
                error instanceof Error &&
                error.message.includes(
                    'UNIQUE constraint failed: users.email',
                )
            ) {
                throw new AppError(
                    409,
                    'Email address already exists.',
                );
            }

            throw error;
        }
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