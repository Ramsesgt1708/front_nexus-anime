interface Usuario {
  _id: number;
  nombre: string;
  email: string;
  rol: string;
  plan: string;
  isActive: boolean;
}

class AuthService {
  getToken(): string | null {
    return localStorage.getItem("token");
  }

  getExpiracion(): string | null {
    return localStorage.getItem("expiracion");
  }

  getUsuario(): Usuario | null {
    const usuarioString = localStorage.getItem("usuario");
    if (!usuarioString) return null;

    try {
      return JSON.parse(usuarioString);
    } catch (error) {
      console.error("Error al parsear usuario:", error);
      return null;
    }
  }

  getUserName(): string {
    const usuario = this.getUsuario();
    return usuario?.nombre || "Usuario";
  }

  getUserEmail(): string {
    const usuario = this.getUsuario();
    return usuario?.email || "";
  }

  getUserRole(): string {
    const usuario = this.getUsuario();
    return usuario?.rol || "";
  }

  getUserPlan(): string {
    const usuario = this.getUsuario();
    return usuario?.plan || "";
  }

  saveAuthData(token: string, expiracion: string, usuario: Usuario): void {
    localStorage.setItem("token", token);
    localStorage.setItem("expiracion", expiracion);
    localStorage.setItem("usuario", JSON.stringify(usuario));
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  clearAuthData(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("expiracion");
    localStorage.removeItem("usuario");
  }

  isTokenExpired(): boolean {
    const expiracion = this.getExpiracion();
    if (!expiracion) return true;

    const expiracionDate = new Date(expiracion);
    const now = new Date();
    return now >= expiracionDate;
  }
}

export default new AuthService();
