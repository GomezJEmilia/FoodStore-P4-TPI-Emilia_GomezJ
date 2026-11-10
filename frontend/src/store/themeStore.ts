import { create } from 'zustand'

import {
  createJSONStorage,
  persist,
} from 'zustand/middleware'


interface ThemeState {
  darkMode: boolean
  toggleTheme: () => void
}


export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      darkMode: false,

      toggleTheme: () => {
        set((estado) => ({
          darkMode: !estado.darkMode,
        }))
      },
    }),
    {
      name: 'theme-storage',

      storage: createJSONStorage(
        () => localStorage,
      ),

      partialize: (estado) => ({
        darkMode: estado.darkMode,
      }),
    },
  ),
)