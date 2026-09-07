import { createRoot } from 'react-dom/client';
import App from '@/renderer/App';
import '@/renderer/i18n';
// The one stylesheet the page loads. Material Plus is imported from inside it,
// see `assets/css/global.css`.
import '@/renderer/assets/css/global.css';

createRoot(document.getElementById('app')!).render(<App />);
