// Validates profile/profile.json and profile/leads.json. Agents run it after every write.
// Passes on a fresh clone (no profile yet). Usage: pnpm leads:check
import { existsSync, readFileSync } from 'node:fs';
import type { Lead, Profile } from './profile.ts';
import { leadErrors } from './validate.ts';

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
		const ids = new Set<string>();
		const urls = new Set<string>();
		leads.forEach((l, i) => {
			const at = `leads.json[${i}] (${l.leadId ?? '?'})`;
			for (const e of leadErrors(l as unknown as Record<string, unknown>)) errors.push(`${at}: ${e}`);
			if (ids.has(l.leadId)) errors.push(`${at}: duplicate leadId`);
			ids.add(l.leadId);
			if (l.jobUrl && urls.has(l.jobUrl)) errors.push(`${at}: duplicate jobUrl`);
			if (l.jobUrl) urls.add(l.jobUrl);
		});
	}
}

if (errors.length) {
	console.error(errors.join('\n'));
	process.exit(1);
}
console.log(profile ? `ok: profile + ${leads?.length ?? 0} leads` : 'ok: no profile yet (run /setup in Claude Code)');
