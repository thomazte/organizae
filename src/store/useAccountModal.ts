import { create } from "zustand";

interface AccountModalStore {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const useAccountModal = create<AccountModalStore>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));
