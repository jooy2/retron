import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function NotFoundScreen() {
  const [t] = useTranslation(['common']);

  return (
    <div>
      <h1>{t('not-found-title')}</h1>
      <Link to="/">{t('not-found-link')}</Link>
    </div>
  );
}
