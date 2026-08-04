import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/renderer/store';

/*
 * Pre-typed versions of the react-redux hooks.
 * Prefer them over the plain `useDispatch` and `useSelector` so that the store
 * shape and the thunk-aware dispatch signature do not have to be repeated.
 * */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
