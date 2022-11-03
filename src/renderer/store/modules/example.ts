import { createAction, handleActions } from 'redux-actions';

const initialState = {
  version: 'Unknown',
};

const SET_VERSION = 'example/SET_VERSION';

export const setVersion = createAction(SET_VERSION);

export default handleActions(
  {
    [SET_VERSION]: (state, action) => ({
      ...state,
      version: action.payload,
    }),
  },
  initialState,
);
