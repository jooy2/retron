import { createRoot } from 'react-dom/client';
import App from '@/renderer/App';
import '@/renderer/i18n';

// Add API key defined in contextBridge to window object type
declare global {
  interface Window {
    mainApi?: any;
  }
}

createRoot(document.getElementById('app')!).render(<App />);
