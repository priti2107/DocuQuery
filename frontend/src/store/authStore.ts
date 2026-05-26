import { useState, useEffect } from "react";

type Listener = (isAuthenticated: boolean) => void;
let listeners: Listener[] = [];

export const authStore = {
  /**
   * Retrieves the access token from localStorage.
   */
  getToken(): string | null {
    return localStorage.getItem("access_token");
  },

  /**
   * Sets the access token in localStorage and notifies all subscribers.
   */
  setToken(token: string): void {
    localStorage.setItem("access_token", token);
    listeners.forEach((listener) => listener(true));
  },

  /**
   * Clears the access token from localStorage and notifies all subscribers.
   */
  logout(): void {
    localStorage.removeItem("access_token");
    listeners.forEach((listener) => listener(false));
  },

  /**
   * Checks if the user is currently authenticated (token exists).
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  /**
   * Subscribes to changes in authentication state.
   * Returns an unsubscribe function.
   */
  subscribe(listener: Listener): () => void {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },
};

/**
 * A custom React hook to access authentication state and status reactively.
 */
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(authStore.isAuthenticated());

  useEffect(() => {
    setIsAuthenticated(authStore.isAuthenticated());
    
    // Subscribe to state updates (e.g., login, logout events)
    const unsubscribe = authStore.subscribe((status) => {
      setIsAuthenticated(status);
    });

    return unsubscribe;
  }, []);

  return {
    isAuthenticated,
    getToken: authStore.getToken,
    logout: () => authStore.logout(),
  };
}
