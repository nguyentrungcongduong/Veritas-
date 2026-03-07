import { create } from 'zustand';

type Role = 'DETECTIVE' | 'CRIMINAL' | null;

interface UserState {
    activeRole: Role;
    setRole: (role: Role) => void;
}

export const useUserStore = create<UserState>((set) => ({
    activeRole: null,
    setRole: (role) => set({ activeRole: role }),
}));
