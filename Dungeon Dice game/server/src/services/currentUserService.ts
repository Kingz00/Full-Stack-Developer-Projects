import { AppError } from '../errors/AppError.js';
import { UserRepository } from '../repositories/userRepository.js';

export class CurrentUserService {
    constructor(
        private readonly userRepository: UserRepository,
    ) { }

    getUser(userId: number) {
        return this.userRepository.findById(userId);
    }
}