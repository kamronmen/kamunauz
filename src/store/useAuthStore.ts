import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "CASHIER" | "DIRECTOR";

interface AuthState {
  role: UserRole;
  isOwner: boolean;
  directorPin: string;
  loginOwner: (pinInput: string) => boolean;
  loginDirector: (pinInput: string) => boolean;
  logoutOwner: () => void;
  switchRole: (newRole: UserRole, pinInput?: string) => boolean;
  setDirectorPin: (newPin: string) => void;
  setPinCode: (newPin: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      role: "DIRECTOR", // default director mode
      isOwner: true,
      directorPin: "7777", // default director PIN

      loginOwner: (pinInput: string) => {
        if (pinInput === get().directorPin) {
          set({ role: "DIRECTOR", isOwner: true });
          return true;
        }
        return false;
      },

      loginDirector: (pinInput: string) => {
        if (pinInput === get().directorPin) {
          set({ role: "DIRECTOR", isOwner: true });
          return true;
        }
        return false;
      },

      logoutOwner: () => {
        set({ role: "CASHIER", isOwner: false });
      },

      switchRole: (newRole: UserRole, pinInput?: string) => {
        if (newRole === "DIRECTOR") {
          if (pinInput === get().directorPin) {
            set({ role: "DIRECTOR", isOwner: true });
            return true;
          }
          return false;
        } else {
          set({ role: "CASHIER", isOwner: false });
          return true;
        }
      },

      setDirectorPin: (newPin: string) => {
        set({ directorPin: newPin });
      },

      setPinCode: (newPin: string) => {
        set({ directorPin: newPin });
      },
    }),
    {
      name: "savdopro-auth-storage",
    }
  )
);
