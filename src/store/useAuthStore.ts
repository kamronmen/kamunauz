import { create } from "zustand";

export type UserRole = "DIRECTOR" | "CASHIER";

interface AuthState {
  role: UserRole;
  isOwner: boolean; // Alias for backward compatibility (true if DIRECTOR)
  pinCode: string;
  cashierName: string;
  loginDirector: (pin: string) => boolean;
  loginOwner: (pin: string) => boolean;
  switchToCashier: () => void;
  logoutOwner: () => void;
  setPinCode: (newPin: string) => void;
  setCashierName: (name: string) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  role: "DIRECTOR", // Default to DIRECTOR on first load for easy configuration
  isOwner: true,
  pinCode: "7777",
  cashierName: "Sotuvchi (Kassir)",

  loginDirector: (pin: string) => {
    if (pin === get().pinCode) {
      set({ role: "DIRECTOR", isOwner: true });
      return true;
    }
    return false;
  },

  loginOwner: (pin: string) => {
    return get().loginDirector(pin);
  },

  switchToCashier: () => {
    set({ role: "CASHIER", isOwner: false });
  },

  logoutOwner: () => {
    set({ role: "CASHIER", isOwner: false });
  },

  setPinCode: (newPin: string) => {
    set({ pinCode: newPin });
  },

  setCashierName: (name: string) => {
    set({ cashierName: name });
  },
}));

