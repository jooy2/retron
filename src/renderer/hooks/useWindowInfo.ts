import { useSyncExternalStore } from 'react';
import { mainChannels, rendererChannels, type WindowInfo } from '@/common/ipc';

/*
 * What the current window is, and which other windows are open next to it.
 *
 * The main process owns the window list, so the state is asked for once and
 * kept up to date from the broadcast after that. A window that opens later
 * would otherwise miss every change until the next one.
 *
 * The state is held outside React and read through `useSyncExternalStore`, so a
 * second component asking for it does not open a second ipc listener and a
 * second request alongside the first.
 * */

let windowInfo: WindowInfo = {
  isChildWindow: false,
  childWindowIds: [],
};

const listeners = new Set<() => void>();
let subscribedToMain = false;
let broadcastReceived = false;

const setWindowInfo = (nextWindowInfo: WindowInfo): void => {
  windowInfo = nextWindowInfo;

  listeners.forEach((listener) => listener());
};

/*
 * Attached on the first render that asks for the state, and left in place for
 * as long as the window lives.
 * */
const subscribeToMain = (): void => {
  if (subscribedToMain) {
    return;
  }

  subscribedToMain = true;

  window.mainApi.on(rendererChannels.windowsUpdated, (_event, childWindowIds) => {
    broadcastReceived = true;

    // Whether this window is a child of the main one cannot change while it is
    // open, so only the list is taken from the broadcast.
    setWindowInfo({ ...windowInfo, childWindowIds });
  });

  void window.mainApi.invoke(mainChannels.requestWindowInfo).then((currentInfo) => {
    setWindowInfo({
      isChildWindow: currentInfo.isChildWindow,
      // A broadcast that landed while the request was in flight is the newer of
      // the two, so the answer to the request does not overwrite it
      childWindowIds: broadcastReceived ? windowInfo.childWindowIds : currentInfo.childWindowIds,
    });
  });
};

const subscribe = (onStoreChange: () => void): (() => void) => {
  subscribeToMain();
  listeners.add(onStoreChange);

  return () => {
    listeners.delete(onStoreChange);
  };
};

const getWindowInfo = (): WindowInfo => windowInfo;

export default function useWindowInfo(): WindowInfo {
  return useSyncExternalStore(subscribe, getWindowInfo);
}
