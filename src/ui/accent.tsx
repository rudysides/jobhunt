/*
 * Accent color: the user's choice, remembered by the browser (localStorage).
 * When storage can't be read or written, the default orange (the logo dot) stays.
 */
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

// Mantine palette colors. Red and yellow are missing on purpose: they belong to problems.
export const accents = ['orange', 'blue', 'violet', 'cyan', 'teal', 'green', 'pink'] as const;
export type Accent = (typeof accents)[number];

const KEY = 'jobhunt-local.accent';

function load(): Accent {
	try {
		const v = localStorage.getItem(KEY);
		return accents.includes(v as Accent) ? (v as Accent) : 'orange';
	} catch {
		return 'orange';
	}
}

const AccentContext = createContext<{ accent: Accent; setAccent: (a: Accent) => void }>({
	accent: 'orange',
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
