import type { ReactNode } from 'react';
import { MantineProvider } from '@mantine/core';
import { DatesProvider } from '@mantine/dates';
import { Notifications } from '@mantine/notifications';
import 'dayjs/locale/de';
import 'dayjs/locale/en';
import 'dayjs/locale/es';
import 'dayjs/locale/fr';
import 'dayjs/locale/it';
import 'dayjs/locale/nl';
import 'dayjs/locale/pl';
import 'dayjs/locale/pt';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import './styles.css';
import { theme } from './theme';
import { AccentProvider } from './accent';

export function Providers({ locale = 'en', children }: { locale?: string; children: ReactNode }) {
	return (
		<AccentProvider>
			{(accent) => (
				<MantineProvider theme={{ ...theme, primaryColor: accent }} defaultColorScheme="auto">
					<DatesProvider settings={{ locale, firstDayOfWeek: 1, weekendDays: [] }}>
						<Notifications position="bottom-center" autoClose={3200} />
						{children}
					</DatesProvider>
				</MantineProvider>
			)}
		</AccentProvider>
	);
}
