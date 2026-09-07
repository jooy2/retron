/*
 * The window background, shared by the three processes.
 *
 * The main process paints it before the page exists and the renderer hands the
 * same value to Material UI, so the two have to agree. When they do not, a new
 * window shows one color and then settles on another.
 *
 * See `src/common/ipc.ts` for what may live in this folder.
 * */
export const backgroundColors = {
  dark: '#111111',
  light: '#ffffff',
} as const;
