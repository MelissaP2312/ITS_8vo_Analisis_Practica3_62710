import {User} from "../../core/domain/User";
import {AuthService} from "../../core/ports/AuthService";

export class AuthServiceImpl implements AuthService {
    async login(email: string, password: string): Promise<User | null> {
        try{
            const response = await fetch("http://localhost:8000/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                body: JSON.stringify({email, password}),
            })

            if (!response.ok) {
                return null;
            }
            
            const data = await response.json();
            const userData = data.data || data.user; // data.data o data.user
            const token = data.token || data.access_token; // data.token o data.access_token

            return {
                id: userData.id,
                name: userData.name,
                email: userData.email,
                token
            }
        }
        catch (error) {
            console.error("Error during login:", error);
            return null;
        }
    }

    async register(name: string, email: string, password: string): Promise<User | null> {
        try {
            const response = await fetch(`http://localhost:8000/api/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                body: JSON.stringify({ name, email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                console.error("Registration failed:", errorData?.message || response.statusText);
                return null;
            }

            const data = await response.json();
            const userData = data.data || data.user;
            const token = data.token || data.access_token;

            if (!userData || !token) {
                console.error("Invalid registration response:", data);
                return null;
            }

            // Guardar el token en localStorage
            localStorage.setItem('auth_token', token);

            return {
                id: userData.id.toString(),
                name: userData.name,
                email: userData.email,
                token: token
            };
        } catch (error) {
            console.error("Error during registration:", error);
            return null;
        }
    }

    async logout(): Promise<void> {
        try {
            const token = localStorage.getItem('auth_token');
            
            if (!token) {
                console.warn("No token found, already logged out");
                return;
            }

            const response = await fetch(`http://localhost:8000/api/auth/logout`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Logout request failed");
            }

            // Limpiar el token del almacenamiento local
            localStorage.removeItem('auth_token');
            
        } catch (error) {
            console.error("Error during logout:", error);
            // Limpiar el token incluso si hay error en la solicitud
            localStorage.removeItem('auth_token');
            throw error;
        }
    }
}