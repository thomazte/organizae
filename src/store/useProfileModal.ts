import { create } from "zustand";

interface ProfileModalStore {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const useProfileModal = create<ProfileModalStore>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));
