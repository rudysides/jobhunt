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

const files = import.meta.glob<unknown>('../profile/*.json', { eager: true, import: 'default' });

export const profile = (files['../profile/profile.json'] as Profile | undefined) ?? null;
export const leads = (files['../profile/leads.json'] as Lead[] | undefined) ?? [];
