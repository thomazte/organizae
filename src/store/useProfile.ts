import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Profile {
  name: string;
  /** Avatar como data URL (imagem comprimida) ou null. */
  avatar: string | null;
}

interface ProfileStore extends Profile {
  setProfile: (data: Partial<Profile>) => void;
  reset: () => void;
}

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set) => ({
      name: "",
      avatar: null,
      setProfile: (data) => set((s) => ({ ...s, ...data })),
      reset: () => set({ name: "", avatar: null }),
    }),
    { name: "organizae-profile" }
  )
);
