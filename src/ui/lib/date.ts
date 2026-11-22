// Local date (YYYY-MM-DD), not UTC, otherwise late evenings show tomorrow.
export const today = () => new Date().toLocaleDateString('sv-SE');

/** Short date like "Nov 26"; the year only when it is not this year. */
export const shortDate = (ymd: string, locale = 'en') => {
	const d = new Date(`${ymd}T00:00`);
	const sameYear = d.getFullYear() === new Date().getFullYear();
	return d.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: sameYear ? undefined : 'numeric' });
};
