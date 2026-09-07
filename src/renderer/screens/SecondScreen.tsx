import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeftIcon, CloseIcon, MPButton, MPIcon, MPTypography } from 'material-plus-ui';
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
    <div className="app-notice">
      <MPTypography className="app-notice__title" level="h1">
        {t('second-title')}
      </MPTypography>
      <MPTypography className="app-notice__desc" level="lead">
        {t('second-desc')}
      </MPTypography>
      {isChildWindow ? (
        <MPButton
          data-testid="btn-close-window"
          startIcon={<MPIcon icon={CloseIcon} size={18} />}
          onClick={handleCloseWindow}
        >
          {t('close-window')}
        </MPButton>
      ) : (
        <MPButton
          variant="text"
          render={<Link to="/" />}
          startIcon={<MPIcon icon={ChevronLeftIcon} size={18} />}
        >
          {t('not-found-link')}
        </MPButton>
      )}
    </div>
  );
}
