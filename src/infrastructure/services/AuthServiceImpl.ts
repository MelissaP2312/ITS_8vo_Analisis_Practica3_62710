import { User } from "../../core/domain/User";
import { AuthService } from "../../core/ports/AuthService";

export class AuthServiceImpl implements AuthService {
    private readonly API_BASE_URL = "http://localhost:8000/api/auth";
    private readonly AUTH_TOKEN_KEY = 'auth_token';
    private readonly TOKEN_TIMESTAMP_KEY = 'token_timestamp';
    private readonly TOKEN_EXPIRATION_TIME = 30 * 1000; // 30 segundos

    private getToken(): string | null {
        return localStorage.getItem(this.AUTH_TOKEN_KEY);
    }

    private isTokenExpired(): boolean {
        const timestamp = localStorage.getItem(this.TOKEN_TIMESTAMP_KEY);
        if (!timestamp) return true;

        const elapsedTime = Date.now() - parseInt(timestamp, 10);
        return elapsedTime > this.TOKEN_EXPIRATION_TIME;
    }

    private getAuthHeaders(): HeadersInit {
        const token = this.getToken();
        if (!token) {
            console.warn("Intentando obtener headers sin token, evitando solicitud.");
            return {};
        }

        return {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`
        };
    }

    async login(email: string, password: string): Promise<User | null> {
        try {
            const response = await fetch(`${this.API_BASE_URL}/login`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                console.error("Login failed:", errorData?.message || response.statusText);
                return null;
            }

            const data = await response.json();

            if (!data.user || !data.token) {
                console.error("Invalid login response:", data);
                return null;
            }

            localStorage.setItem(this.AUTH_TOKEN_KEY, data.token);
            localStorage.setItem(this.TOKEN_TIMESTAMP_KEY, Date.now().toString());

            setTimeout(() => {
                console.warn("Sesión expirada, eliminando token...");
                localStorage.removeItem(this.AUTH_TOKEN_KEY);
                localStorage.removeItem(this.TOKEN_TIMESTAMP_KEY);
            }, this.TOKEN_EXPIRATION_TIME);

            return { id: data.user.id.toString(), name: data.user.name, email: data.user.email, token: data.token };
        } catch (error) {
            console.error("Login error:", error);
            return null;
        }
    }

    async register(name: string, email: string, password: string): Promise<User | null> {
        try {
            const response = await fetch(`${this.API_BASE_URL}/register`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                console.error("Registration failed:", errorData?.message || response.statusText);
                return null;
            }

            const data = await response.json();

            if (!data.user || !data.token) {
                console.error("Invalid registration response:", data);
                return null;
            }

            return { id: data.user.id.toString(), name: data.user.name, email: data.user.email, token: data.token };
        } catch (error) {
            console.error("Registration error:", error);
            return null;
        }
    }

    async logout(): Promise<void> {
        try {
            const response = await fetch(`${this.API_BASE_URL}/logout`, {
                method: "POST",
                headers: this.getAuthHeaders(),
            });
    
            if (!response.ok) {
                console.warn("Error al cerrar sesión en el servidor");
            }
        } catch (error) {
            console.error("Logout API error:", error);
        } finally {
            localStorage.removeItem(this.AUTH_TOKEN_KEY);
            localStorage.removeItem(this.TOKEN_TIMESTAMP_KEY);
            window.dispatchEvent(new Event('authExpired'));
        }
    }

    async verifyAuth(): Promise<boolean> {
        if (this.isTokenExpired()) {
            console.warn("Token expirado, eliminando token localmente...");
            localStorage.removeItem(this.AUTH_TOKEN_KEY);
            localStorage.removeItem(this.TOKEN_TIMESTAMP_KEY);
            return false;
        }

        try {
            const token = this.getToken();
            if (!token) {
                console.warn("Token no encontrado");
                return false;
            }

            const response = await fetch("http://localhost:8000/api/user", {
                method: "GET",
                headers: this.getAuthHeaders(),
            });

            if (!response.ok) {
                console.warn("Token inválido o expirado:", response.status);
                localStorage.removeItem(this.AUTH_TOKEN_KEY);
                localStorage.removeItem(this.TOKEN_TIMESTAMP_KEY);
                return false;
            }

            const data = await response.json();
            console.log("Usuario autenticado:", data);
            return !!data?.id;
        } catch (error) {
            console.error("Auth verification error:", error);
            return false;
        }
    }
}
