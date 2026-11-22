/*
 * Accent color: the user's choice, remembered by the browser (localStorage).
 * When storage can't be read or written, the default blue stays.
 */
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

// Mantine palette colors. Red and yellow are missing on purpose: they belong to problems.
export const accents = ['blue', 'violet', 'cyan', 'teal', 'green', 'orange', 'pink'] as const;
export type Accent = (typeof accents)[number];

const KEY = 'jobhunt-local.accent';

function load(): Accent {
	try {
		const v = localStorage.getItem(KEY);
		return accents.includes(v as Accent) ? (v as Accent) : 'blue';
	} catch {
		return 'blue';
	}
}

const AccentContext = createContext<{ accent: Accent; setAccent: (a: Accent) => void }>({
	accent: 'blue',
	setAccent: () => {},
});

export function AccentProvider({ children }: { children: (accent: Accent) => ReactNode }) {
	const [accent, setState] = useState(load);
	const setAccent = useCallback((a: Accent) => {
		setState(a);
		try {
			localStorage.setItem(KEY, a);
		} catch {
			// without storage the choice lasts until reload
		}
	}, []);
	return <AccentContext.Provider value={{ accent, setAccent }}>{children(accent)}</AccentContext.Provider>;
}

export const useAccent = () => useContext(AccentContext);
