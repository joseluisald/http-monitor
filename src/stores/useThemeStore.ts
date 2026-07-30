import { create } from 'zustand';

interface ThemeState {
  darkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (dark: boolean) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  darkMode: true, // Telescope dark mode default
  toggleDarkMode: () =>
    set((state) => {
      const next = !state.darkMode;
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return { darkMode: next };
    }),
  setDarkMode: (dark) => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ darkMode: dark });
  },
}));
