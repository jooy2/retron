/*
 * Values the renderer modules share.
 *
 * This is renderer process only, unlike `src/common`: it describes the web page
 * the app runs in, which neither the main process nor the preload script has.
 * */

// The color scheme the operating system asks for. The browser engine reports it
// directly, so the theme needs no round trip to the main process.
export const SYSTEM_DARK_THEME_QUERY = '(prefers-color-scheme: dark)';

/*
 * The one color Material Plus generates every color role from, picked to match
 * the cyan in the application logo. Change it and the whole palette follows.
 *
 * The `surface` role it generates is written out in `src/common/theme.ts`,
 * because the main process paints a window before the page can derive anything.
 * Changing this color means changing those two values as well.
 * */
export const THEME_SOURCE_COLOR = '#149eca';
