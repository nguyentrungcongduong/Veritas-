import { create } from 'zustand';

interface User {
    id: number;
    name: string;
    alias: string;
    email: string;
    fame: number;
    prestige: number;
    rank: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (userData: User, token: string) => void;
    logout: () => void;
    checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    isAuthenticated: false,

    login: (userData, token) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('veritas_token', token);
            localStorage.setItem('veritas_user', JSON.stringify(userData));
        }
        set({ user: userData, token: token, isAuthenticated: true });
    },

    logout: () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('veritas_token');
            localStorage.removeItem('veritas_user');
        }
        set({ user: null, token: null, isAuthenticated: false });
    },

    checkAuth: () => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('veritas_token');
            const userStr = localStorage.getItem('veritas_user');
            if (token && userStr) {
                try {
                    const user = JSON.parse(userStr);
                    set({ isAuthenticated: true, user, token });
                } catch (e) {
                    localStorage.removeItem('veritas_token');
                    localStorage.removeItem('veritas_user');
                }
            }
        }
    }
}));
