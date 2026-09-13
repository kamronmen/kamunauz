import { create } from "zustand";

interface AuthState {
  isOwner: boolean;
  pinCode: string;
  loginOwner: (pin: string) => boolean;
  logoutOwner: () => void;
  setPinCode: (newPin: string) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isOwner: true, // Default unlocked for easy demo
  pinCode: "7777", // Default Owner PIN

  loginOwner: (pin: string) => {
    if (pin === get().pinCode) {
      set({ isOwner: true });
      return true;
    }
    return false;
  },

  logoutOwner: () => {
    set({ isOwner: false });
  },

  setPinCode: (newPin: string) => {
    set({ pinCode: newPin });
  },
}));
