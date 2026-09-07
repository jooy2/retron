import { useTranslation } from 'react-i18next';
import {
  ExternalLinkIcon,
  MPButton,
  MPCard,
  MPGrid,
  MPGridItem,
  MPIcon,
  MPIconButton,
  MPSelect,
  MPStatistic,
  MPTypography,
  type MPSelectValue,
} from 'material-plus-ui';
import { increaseCount, setDarkTheme } from '@/renderer/store/slices/appScreenSlice';
import { fallbackLanguage, languageNames, supportedLanguages } from '@/common/locales';
import { mainChannels } from '@/common/ipc';
import { useAppDispatch, useAppSelector } from '@/renderer/store/hooks';
import useWindowInfo from '@/renderer/hooks/useWindowInfo';

// The list never changes while the app runs, so it is built once instead of on
// every render of the select below.
const languageItems = supportedLanguages.map((language) => ({
  value: language,
  label: languageNames[language],
}));

// The three demo cards share a row, and drop to two and then to one as the
// window narrows. See `MPResponsive` for what the window classes measure.
const demoCardSpan = { compact: 12, medium: 6, expanded: 4 } as const;

export default function MainScreen() {
  const darkTheme = useAppSelector((state) => state.appScreen.darkTheme);
  const counterValue = useAppSelector((state) => state.appScreen.counterValue);
  const [t, i18n] = useTranslation(['common']);
  const dispatch = useAppDispatch();
  const { childWindowIds } = useWindowInfo();

  const handleGithubLink = (): void => {
    window.mainApi.send(mainChannels.openExternalLink, 'https://github.com/jooy2/retron');
  };

  const handleChangeTheme = (): void => {
    dispatch(setDarkTheme(!darkTheme));
  };

  const handleIncreaseCount = (): void => {
    dispatch(increaseCount());
  };

  // The second screen is opened in a window of its own. The main process
  // answers with `null` when it refuses, see `FEAT_MULTI_WINDOW`.
  const handleOpenWindow = async (): Promise<void> => {
    await window.mainApi.invoke(mainChannels.openWindow, '/second');
  };

  const handleChangeLanguage = async (language: MPSelectValue | null): Promise<void> => {
    // The select speaks in `string | number | null`, so what it reports is
    // checked before it reaches i18next rather than after
    if (typeof language !== 'string') {
      return;
    }

    // The detector caches the choice, so it is restored on the next launch
    await i18n.changeLanguage(language);
  };

  return (
    <div className="app">
      <header className="app__topbar">
        <img
          className="app__logo"
          data-testid="main-logo"
          alt="Retron"
          src="images/retron-logo.webp"
          draggable="false"
        />
        <div className="app__actions">
          <MPIconButton
            data-testid="btn-change-theme"
            size="sm"
            label={t('theme')}
            icon={<span aria-hidden="true">{darkTheme ? '🌞' : '🌙'}</span>}
            onClick={handleChangeTheme}
          />
          {/*
            The select draws its own trigger and forwards no arbitrary
            attributes, so the test hook goes on the element around it.
          */}
          <div className="app__language" data-testid="select-language">
            <MPSelect
              fullWidth
              size="sm"
              label={t('language')}
              items={languageItems}
              value={i18n.resolvedLanguage ?? fallbackLanguage}
              onValueChange={(language) => void handleChangeLanguage(language)}
            />
          </div>
        </div>
      </header>

      <main className="app__main">
        <section className="app-hero">
          <MPTypography className="app-hero__title" level="h1">
            {t('hello-title')}
          </MPTypography>
          <MPTypography className="app-hero__desc" level="lead">
            {t('hello-desc')}
          </MPTypography>
          <MPButton
            className="app-hero__cta"
            onClick={handleGithubLink}
            endIcon={<MPIcon icon={ExternalLinkIcon} size={18} />}
          >
            {t('source-code')}
          </MPButton>
        </section>

        <MPGrid columns={12} spacing={2}>
          <MPGridItem span={demoCardSpan}>
            <MPCard className="app-demo" variant="filled">
              <div className="app-demo__row">
                <MPStatistic
                  data-testid="counter-value"
                  size="lg"
                  label={t('count-value')}
                  value={<span role="status">{counterValue}</span>}
                />
                <MPButton
                  data-testid="btn-counter"
                  variant="tonal"
                  color="tertiary"
                  size="sm"
                  onClick={handleIncreaseCount}
                >
                  +1
                </MPButton>
              </div>
            </MPCard>
          </MPGridItem>

          <MPGridItem span={demoCardSpan}>
            <MPCard className="app-demo" variant="filled">
              <div className="app-demo__row">
                <MPStatistic
                  data-testid="window-count"
                  size="lg"
                  label={t('window-count')}
                  value={<span role="status">{childWindowIds.length}</span>}
                />
                <MPButton
                  data-testid="btn-open-window"
                  variant="tonal"
                  size="sm"
                  onClick={handleOpenWindow}
                >
                  {t('open-window')}
                </MPButton>
              </div>
            </MPCard>
          </MPGridItem>

          <MPGridItem span={demoCardSpan}>
            <MPCard className="app-demo" variant="filled">
              <div className="app-demo__row">
                <MPStatistic
                  size="lg"
                  label={t('using-version')}
                  // Replaced with the `package.json` version at build time
                  value={`v${__APP_VERSION__}`}
                />
              </div>
            </MPCard>
          </MPGridItem>
        </MPGrid>
      </main>
    </div>
  );
}
