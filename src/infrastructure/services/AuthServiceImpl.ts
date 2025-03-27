import {User} from "../../core/domain/User";
import {AuthService} from "../../core/ports/AuthService";

export class AuthServiceImpl implements AuthService {
    async login(email: string, password: string): Promise<User | null> {
        if(email === "user@example.com" && password === "password"){
            return {
                id: "1",
                email,
                name: "John Doe",
                token: "fake-jwt-token"
            };
        }
        return null;
    }

    async logout(): Promise<void> {
        throw new Error("Method not implemented.");
    }
}