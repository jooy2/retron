import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface AppScreenState {
  version: string;
  darkTheme: boolean;
  counterValue: number;
}

const initialState: AppScreenState = {
  version: 'Unknown',
  darkTheme: false,
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
    },
    increaseCount: (state) => {
      state.counterValue += 1;
    },
  },
});

export const { setVersion, setDarkTheme, increaseCount } = appScreenSlice.actions;

export default appScreenSlice.reducer;
