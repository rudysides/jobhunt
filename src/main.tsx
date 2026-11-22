import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Providers } from './ui';
import { locale } from './i18n';
import App from './App.tsx';
import { ErrorBoundary } from './ErrorBoundary.tsx';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<Providers locale={locale}>
			<ErrorBoundary>
				<App />
			</ErrorBoundary>
		</Providers>
	</StrictMode>
);
