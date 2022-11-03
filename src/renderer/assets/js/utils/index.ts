import { shell } from 'electron';

export default class Utils {
  static async openExternal(url: string): Promise<void> {
    await shell.openExternal(url);
  }
}

export const { openExternal } = Utils;
