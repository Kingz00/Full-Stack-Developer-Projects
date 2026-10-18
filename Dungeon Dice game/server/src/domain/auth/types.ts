export interface Credentials {
    username: string;
    password: string;
}

export interface RegistrationInput extends Credentials {
    email: string;
}

export interface AuthUser {
    id: number;
    username: string;
    createdAt: string;
}