import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ReminderStore {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

export const useReminderStore = create<ReminderStore>()(
  persist(
    (set) => ({
      enabled: false,
      setEnabled: (enabled) => set({ enabled }),
    }),
    { name: "organizae-reminders" }
  )
);
