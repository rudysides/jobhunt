// One set of rules for lead data, shared by `pnpm leads:check`, backup import and rendering (JL-03, JL-05).
// Plain TypeScript without imports, so Node (leads:check) and Vite (the app) both load it.

/** A plain address: no whitespace and none of the characters that would add mailto: parameters. */
export const isEmail = (s: string) =>
	s.length <= 254 && /^[^\s@?&#%<>"',;:()[\]\\]+@[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(s);

/** Only http(s) links: no javascript:, data: or file: URLs. */
export function isHttpUrl(s: string) {
	if (s.length > 2048) return false;
	try {
		const { protocol } = new URL(s);
		return protocol === 'http:' || protocol === 'https:';
	} catch {
		return false;
	}
}

// Control characters except tab and newline, plus bidi overrides that can disguise text.
// oxlint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u0008\u000B-\u001F\u007F\u202A-\u202E\u2066-\u2069]/g;

/** Strips control characters and caps the length. Anything that isn't a string becomes ''. */
export const cleanText = (v: unknown, max = 2000) =>
	typeof v === 'string' ? v.replace(CONTROL, '').slice(0, max) : '';

export const hasControlChars = (s: string) => new RegExp(CONTROL.source).test(s);

const STRING_FIELDS = ['company', 'position', 'location', 'contactName', 'role', 'source', 'salary', 'notes'];

/** Problems with one lead from leads.json. Empty when it is fine. */
export function leadErrors(lead: Record<string, unknown>): string[] {
	const errors: string[] = [];
	for (const k of ['leadId', ...STRING_FIELDS, 'email', 'jobUrl', 'foundAt']) {
		const v = lead[k];
		if (typeof v !== 'string') errors.push(`"${k}" must be a string`);
		else if (hasControlChars(v)) errors.push(`"${k}" contains control characters`);
		else if (v.length > (k === 'notes' ? 2000 : 300)) errors.push(`"${k}" is too long`);
	}
	const { leadId, email, jobUrl, foundAt, fit } = lead;
	if (typeof leadId !== 'string' || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(leadId)) errors.push('leadId must be kebab-case');
	if (typeof email === 'string' && email && !isEmail(email)) errors.push('email is not a plain address');
	if (typeof jobUrl === 'string' && jobUrl && !isHttpUrl(jobUrl)) errors.push('jobUrl must be an http(s) link');
	if (typeof foundAt !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(foundAt)) errors.push('foundAt must be YYYY-MM-DD');
	if (fit !== undefined && !(Number.isInteger(fit) && (fit as number) >= 1 && (fit as number) <= 5))
		errors.push('fit must be an integer 1-5');
	return errors;
}
