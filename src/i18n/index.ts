/*
 * UI language. Picked once at load: the choice saved in Settings, then profile.locale, then the browser, then English.
 * Strings are read at module level in places, so changing the language reloads the page.
 */
import { profile } from '../profile';
import { en, type Messages } from './en';
import { de } from './de';
import { es } from './es';
import { fr } from './fr';
import { it } from './it';
import { nl } from './nl';
import { pl } from './pl';
import { pt } from './pt';

// Labels are each language's own name, so they stay readable whatever the current UI language is.
export const languages = [
	{ code: 'en', label: 'English', messages: en },
	{ code: 'de', label: 'Deutsch', messages: de },
	{ code: 'fr', label: 'Français', messages: fr },
	{ code: 'es', label: 'Español', messages: es },
	{ code: 'it', label: 'Italiano', messages: it },
	{ code: 'nl', label: 'Nederlands', messages: nl },
	{ code: 'pt', label: 'Português', messages: pt },
	{ code: 'pl', label: 'Polski', messages: pl },
] as const satisfies readonly { code: string; label: string; messages: Messages }[];

const KEY = 'jobhunt-local.locale';

// 'de-AT' → 'de'; unknown → undefined.
const supported = (tag: string | null | undefined) => {
	const base = tag?.toLowerCase().split('-')[0];
	return languages.find((l) => l.code === base)?.code;
};

function stored() {
	try {
		return localStorage.getItem(KEY);
	} catch {
		return null;
	}
}

export const locale: string =
	supported(stored()) ?? supported(profile?.locale) ?? navigator.languages.map(supported).find(Boolean) ?? 'en';

export const t: Messages = languages.find((l) => l.code === locale)!.messages;

document.documentElement.lang = locale;

export function setLocale(code: string) {
	try {
		localStorage.setItem(KEY, code);
	} catch {
		// without storage the choice can't survive the reload, so don't reload into the old language
		return;
	}
	location.reload();
}
