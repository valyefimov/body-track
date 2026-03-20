import App from '@/App';
import { AppProviders } from '@/app/providers';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import '@/index.css';

registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(
  <AppProviders>
    <App />
  </AppProviders>,
);
