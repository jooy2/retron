export default class Utils {
  static async openExternal(url: string): Promise<void> {
    await window.mainApi.openExternal(url);
  }
}

export const { openExternal } = Utils;
