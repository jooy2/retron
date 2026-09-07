/*
 * The window background, shared by the three processes.
 *
 * The main process paints it before the page exists, and the renderer hands the
 * same value to Material Plus as its `--mp-sys-color-surface` token, so the two
 * cannot disagree. When they do, a new window shows one color and then settles
 * on another.
 *
 * Each value is Material Design's `surface` role generated from the source color
 * in `src/renderer/constants.ts`. The library derives every other role from that
 * color on its own; only this one is written out, because a window is painted
 * before there is a stylesheet to derive anything from.
 *
 * See `src/common/ipc.ts` for what may live in this folder.
 * */
export const backgroundColors = {
  dark: '#0d1417',
  light: '#f1fcff',
} as const;
