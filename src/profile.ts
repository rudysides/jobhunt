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
