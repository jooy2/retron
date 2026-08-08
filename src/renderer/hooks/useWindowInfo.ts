import { useEffect, useState } from 'react';
import { mainChannels, rendererChannels, type WindowInfo } from '@/common/ipc';

const initialWindowInfo: WindowInfo = {
  isChildWindow: false,
  childWindowIds: [],
};

/*
 * What the current window is, and which other windows are open next to it.
 *
 * The main process owns the window list, so the state is asked for once when
 * the component mounts and kept up to date from the broadcast after that. A
 * window that opens later would otherwise miss every change until the next one.
 * */
export default function useWindowInfo(): WindowInfo {
  const [windowInfo, setWindowInfo] = useState<WindowInfo>(initialWindowInfo);

  useEffect(() => {
    let mounted = true;

    window.mainApi.invoke(mainChannels.requestWindowInfo).then((currentInfo: WindowInfo) => {
      if (mounted) {
        setWindowInfo(currentInfo);
      }
    });

    // `on` returns the function that detaches the listener again
    const unsubscribe = window.mainApi.on(
      rendererChannels.windowsUpdated,
      (_event: unknown, childWindowIds: number[]) => {
        // Whether this window is a child of the main one cannot change while it
        // is open, so only the list is taken from the broadcast.
        setWindowInfo((currentInfo) => ({ ...currentInfo, childWindowIds }));
      },
    );

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return windowInfo;
}
