// Loads the gitignored profile/ folder. import.meta.glob tolerates missing files, so a fresh clone still builds.
export interface Profile {
	name: string;
	contactEmail?: string;
	headline: string;
	targetRoles: string[];
	seniority: string;
	locations: string[];
	remote: 'no' | 'hybrid' | 'only';
	languages: string[];
	salaryMin?: string;
	sources: { id: string; url: string; notes?: string }[];
	exclude: { companies: string[]; keywords: string[] };
	mustHave: string[];
	niceToHave: string[];
	emailTemplate: { subject: string; body: string };
	locale: string;
}

export interface Lead {
	leadId: string;
	company: string;
	position: string;
	location: string;
	contactName: string;
	role: string;
	email: string;
	source: string;
	jobUrl: string;
	salary: string;
	notes: string;
	foundAt: string;
	fit?: number;
}

// `pnpm demo` and the tests use the fictional profile/example/ data, never yours.
export const isDemo = import.meta.env.MODE === 'demo' || import.meta.env.MODE === 'test';

const own = import.meta.glob<unknown>('../profile/*.json', { eager: true, import: 'default' });
const example = import.meta.glob<unknown>('../profile/example/*.json', { eager: true, import: 'default' });
const pick = (name: string) => (isDemo ? example[`../profile/example/${name}`] : own[`../profile/${name}`]);

export const profile = (pick('profile.json') as Profile | undefined) ?? null;
export const leads = (pick('leads.json') as Lead[] | undefined) ?? [];

// Company logos, downloaded once by /find-jobs into profile/logos/<companySlug>.<ext>. Never fetched at runtime.
const logoFiles = isDemo
	? {}
	: import.meta.glob<string>('../profile/logos/*.{png,jpg,webp,svg,ico}', {
			eager: true,
			query: '?url',
			import: 'default',
		});
export const logos: Record<string, string> = Object.fromEntries(
	Object.entries(logoFiles).map(([path, url]) => [path.replace(/^.*\/|\.[^.]+$/g, ''), url])
);

/** Company name without its legal form (s.r.o., a.s., GmbH, …). */
export const companyBase = (name: string) =>
	name.trim().replace(/[\s,]+(a\.\s?s\.|s\.\s?r\.\s?o\.|s\.p\.|spol\..*|gmbh|ltd\.?|inc\.?|llc)$/i, '');

/** File name for a company's logo: "Seznam.cz, a.s." → "seznam-cz". */
export const companySlug = (name: string) =>
	companyBase(name)
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
