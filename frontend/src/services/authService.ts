import { authStore } from "@/store/authStore";

const BASE_URL = "http://localhost:8000";

export interface UserResponse {
  _id?: string;
  id?: string;
  email: string;
  full_name: string;
  role: string;
  documents_limit: number;
  is_active: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export class AuthService {
  /**
   * Helper to perform fetch requests with error handling.
   */
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;
    
    // Set headers
    const headers = new Headers(options.headers || {});
    if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    // Add authorization header if token exists
    const token = authStore.getToken();
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = "An error occurred";
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorMessage;
      } catch {
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Register a new user account.
   * Maps `name` input to `full_name` required by backend.
   */
  static async signup(name: string, email: string, password: string): Promise<TokenResponse> {
    return this.request<TokenResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        full_name: name,
      }),
    });
  }

  /**
   * Authenticate user credentials and retrieve a JWT token.
   */
  static async login(email: string, password: string): Promise<TokenResponse> {
    return this.request<TokenResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
      }),
    });
  }

  /**
   * Fetch current user profile.
   */
  static async getProfile(): Promise<UserResponse> {
    return this.request<UserResponse>("/auth/me", {
      method: "GET",
    });
  }
}
