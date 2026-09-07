import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { SYSTEM_DARK_THEME_QUERY } from '@/renderer/constants';

export const THEME_STORAGE_KEY = 'retron.darkTheme';

export interface AppScreenState {
  darkTheme: boolean;
  followSystemTheme: boolean;
  counterValue: number;
}

const readStoredDarkTheme = (): boolean | null => {
  const storedValue = localStorage.getItem(THEME_STORAGE_KEY);

  return storedValue === null ? null : storedValue === 'true';
};

const storedDarkTheme = readStoredDarkTheme();

const initialState: AppScreenState = {
  // As long as the user has not picked a theme, the operating system decides.
  // The browser engine already knows what it asks for, so this needs no trip to
  // the main process and nothing has to block on the answer.
  darkTheme: storedDarkTheme ?? window.matchMedia(SYSTEM_DARK_THEME_QUERY).matches,
  followSystemTheme: storedDarkTheme === null,
  counterValue: 0,
};

export const appScreenSlice = createSlice({
  name: 'appScreen',
  initialState,
  reducers: {
    setDarkTheme: (state, action: PayloadAction<boolean>) => {
      state.darkTheme = action.payload;
      // An explicit choice wins over the operating system from now on
      state.followSystemTheme = false;
    },
    setSystemDarkTheme: (state, action: PayloadAction<boolean>) => {
      if (!state.followSystemTheme) {
        return;
      }

      state.darkTheme = action.payload;
    },
    increaseCount: (state) => {
      state.counterValue += 1;
    },
  },
});

export const { setDarkTheme, setSystemDarkTheme, increaseCount } = appScreenSlice.actions;

export default appScreenSlice.reducer;
