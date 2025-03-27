import {User} from "../domain/User";

export interface AuthService {
    login(email: string, password: string): Promise<User | null>;
    logout(): Promise<void>;
}