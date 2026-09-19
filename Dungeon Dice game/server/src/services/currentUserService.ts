import { AppError } from '../errors/AppError.js';
import { UserRepository } from '../repositories/userRepository.js';

export class CurrentUserService {
    constructor(
        private readonly userRepository: UserRepository,
    ) { }

    getUser(userId: number) {
        const user = this.userRepository.findById(userId);

        if (!user) {
            throw new AppError(401, 'Authentication required.');
        }

        return user;
    }
}