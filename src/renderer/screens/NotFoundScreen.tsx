import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeftIcon, MPButton, MPIcon, MPTypography } from 'material-plus-ui';

export default function NotFoundScreen() {
  const [t] = useTranslation(['common']);

  return (
    <div className="app-notice">
      <MPTypography className="app-notice__title" level="h1">
        {t('not-found-title')}
      </MPTypography>
      <MPButton
        variant="text"
        render={<Link to="/" />}
        startIcon={<MPIcon icon={ChevronLeftIcon} size={18} />}
      >
        {t('not-found-link')}
      </MPButton>
    </div>
  );
}
