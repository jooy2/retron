import { createRoot } from 'react-dom/client';
import App from '@/renderer/App';
import '@/renderer/i18n';

createRoot(document.getElementById('app')!).render(<App />);
