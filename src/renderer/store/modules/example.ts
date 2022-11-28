import { createAction, handleActions } from 'redux-actions';

const initialState = {
  version: 'Unknown',
  darkTheme: false,
};

const SET_VERSION = 'example/SET_VERSION';
const SET_DARK_THEME = 'example/SET_DARK_THEME';

export const setVersion = createAction(SET_VERSION);
export const setDarkTheme = createAction(SET_DARK_THEME);

export default handleActions(
  {
    [SET_VERSION]: (state, action) => ({
      ...state,
      version: action.payload,
    }),
    [SET_DARK_THEME]: (state, action) => ({
      ...state,
      darkTheme: action.payload,
    }),
  },
  initialState,
);
