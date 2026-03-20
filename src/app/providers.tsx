import { ThemeProvider } from '@/components/theme/theme-provider';
import { store } from '@/store/store';
import { Provider } from 'react-redux';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
        {children}
      </ThemeProvider>
    </Provider>
  );
}
