// Token storage utility that works in both normal and private windows
/* eslint-disable @typescript-eslint/no-explicit-any */
export class TokenStorage {
  private static readonly TOKEN_KEY = "auth_token";

  static setToken(token: string): void {
    try {
      // Try localStorage first
      localStorage.setItem(this.TOKEN_KEY, token);
    } catch {
      // Fallback to sessionStorage if localStorage fails (private mode)
      try {
        sessionStorage.setItem(this.TOKEN_KEY, token);
      } catch {
        // If both fail, store in memory (less secure but works)
        (window as any).__auth_token = token;
      }
    }
  }

  static getToken(): string | null {
    try {
      // Try localStorage first
      const token = localStorage.getItem(this.TOKEN_KEY);
      if (token) return token;
    } catch {
      // Ignore localStorage errors
    }

    try {
      // Try sessionStorage
      const token = sessionStorage.getItem(this.TOKEN_KEY);
      if (token) return token;
    } catch {
      // Ignore sessionStorage errors
    }

    // Fallback to memory storage
    return (window as any).__auth_token || null;
  }

  static removeToken(): void {
    try {
      localStorage.removeItem(this.TOKEN_KEY);
    } catch {
      // Ignore errors
    }

    try {
      sessionStorage.removeItem(this.TOKEN_KEY);
    } catch {
      // Ignore errors
    }

    // Clear memory storage
    delete (window as any).__auth_token;
  }

  static hasToken(): boolean {
    return !!this.getToken();
  }
}
