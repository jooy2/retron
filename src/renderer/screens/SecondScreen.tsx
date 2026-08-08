/** @jsxImportSource @emotion/react */
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import Button from '@mui/material/Button';
import { bodyRoot, jumbo } from '@/renderer/assets/css/global';
import { mainChannels } from '@/common/ipc';
import useWindowInfo from '@/renderer/hooks/useWindowInfo';

export default function SecondScreen() {
  const [t] = useTranslation(['common']);
  // The same screen is reached in the main window and in a window of its own,
  // so what it may do is asked of the main process instead of assumed
  const { isChildWindow } = useWindowInfo();

  const handleCloseWindow = async (): Promise<void> => {
    await window.mainApi.invoke(mainChannels.closeWindow);
  };

  return (
    <div css={bodyRoot}>
      <div css={jumbo}>
        <h1>{t('second-title')}</h1>
        <p>{t('second-desc')}</p>
        {isChildWindow ? (
          <Button data-testid="btn-close-window" variant="contained" onClick={handleCloseWindow}>
            {t('close-window')}
          </Button>
        ) : (
          <Link to="/">{t('not-found-link')}</Link>
        )}
      </div>
    </div>
  );
}
