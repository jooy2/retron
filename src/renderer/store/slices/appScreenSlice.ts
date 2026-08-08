import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { mainChannels } from '@/common/ipc';

export const THEME_STORAGE_KEY = 'retron.darkTheme';

export interface AppScreenState {
  version: string;
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
  version: 'Unknown',
  // As long as the user has not picked a theme, the operating system decides
  darkTheme:
    storedDarkTheme ?? Boolean(window.mainApi.sendSync(mainChannels.requestGetSystemTheme)),
  followSystemTheme: storedDarkTheme === null,
  counterValue: 0,
};

export const appScreenSlice = createSlice({
  name: 'appScreen',
  initialState,
  reducers: {
    setVersion: (state, action: PayloadAction<string>) => {
      state.version = action.payload;
    },
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

export const { setVersion, setDarkTheme, setSystemDarkTheme, increaseCount } =
  appScreenSlice.actions;

export default appScreenSlice.reducer;
