// Validates profile/profile.json and profile/leads.json. Agents run it after every write.
// Passes on a fresh clone (no profile yet). Usage: pnpm leads:check
import { existsSync, readFileSync } from 'node:fs';
import type { Lead, Profile } from '../src/profile.ts';

const errors: string[] = [];
const read = <T>(path: string): T | null => {
	if (!existsSync(path)) return null;
	try {
		return JSON.parse(readFileSync(path, 'utf8')) as T;
	} catch (e) {
		errors.push(`${path}: invalid JSON (${(e as Error).message})`);
		return null;
	}
};

const profile = read<Profile>('profile/profile.json');
if (profile) {
	for (const key of ['name', 'targetRoles', 'locations', 'sources', 'emailTemplate'] as const)
		if (!profile[key]) errors.push(`profile.json: missing "${key}"`);
}

const leads = read<Lead[]>('profile/leads.json');
if (leads) {
	if (!Array.isArray(leads)) errors.push('leads.json: must be an array');
	else {
		const strings = ['leadId', 'company', 'position', 'location', 'contactName', 'role', 'email', 'source', 'jobUrl'];
		const ids = new Set<string>();
		const urls = new Set<string>();
		leads.forEach((l, i) => {
			const at = `leads.json[${i}] (${l.leadId ?? '?'})`;
			for (const k of [...strings, 'salary', 'notes', 'foundAt'])
				if (typeof (l as unknown as Record<string, unknown>)[k] !== 'string')
					errors.push(`${at}: "${k}" must be a string`);
			if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(l.leadId ?? '')) errors.push(`${at}: leadId must be kebab-case`);
			if (ids.has(l.leadId)) errors.push(`${at}: duplicate leadId`);
			ids.add(l.leadId);
			if (l.jobUrl && urls.has(l.jobUrl)) errors.push(`${at}: duplicate jobUrl`);
			if (l.jobUrl) urls.add(l.jobUrl);
			if (!/^\d{4}-\d{2}-\d{2}$/.test(l.foundAt ?? '')) errors.push(`${at}: foundAt must be YYYY-MM-DD`);
			if (l.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(l.email)) errors.push(`${at}: email looks invalid`);
			if (l.fit !== undefined && !(Number.isInteger(l.fit) && l.fit >= 1 && l.fit <= 5))
				errors.push(`${at}: fit must be an integer 1-5`);
		});
	}
}

if (errors.length) {
	console.error(errors.join('\n'));
	process.exit(1);
}
console.log(profile ? `ok: profile + ${leads?.length ?? 0} leads` : 'ok: no profile yet (run /setup in Claude Code)');
