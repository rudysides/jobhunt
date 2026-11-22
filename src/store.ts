import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { today } from './ui';
import { leads, profile, type Lead } from './profile';

export type Status = 'todo' | 'applied';

export interface JobRow extends Omit<Lead, 'leadId' | 'foundAt'> {
	id: string;
	leadId: string | null; // from profile/leads.json
	status: Status;
	appliedAt: string; // YYYY-MM-DD
	updatedAt: string;
}

export const isSent = (r: JobRow) => r.status !== 'todo';

function blankRow(partial: Partial<JobRow> = {}): JobRow {
	return {
		id: crypto.randomUUID(),
		leadId: null,
		company: '',
		position: '',
		location: '',
		contactName: '',
		role: '',
		email: '',
		source: '',
		jobUrl: '',
		salary: '',
		notes: '',
		status: 'todo',
		appliedAt: '',
		updatedAt: new Date().toISOString(),
		...partial,
	};
}

const fromLead = ({ foundAt: _, ...l }: Lead) => blankRow(l);

/** Leads that are not in the list yet and were not dismissed. */
const newLeads = (rows: JobRow[], dismissed: string[]) => {
	const known = new Set([...rows.map((r) => r.leadId), ...dismissed]);
	return leads.filter((l) => !known.has(l.leadId)).map(fromLead);
};

const leadIds = new Set(leads.map((l) => l.leadId));

interface JobsState {
	rows: JobRow[];
	dismissedLeads: string[]; // removed leads, so they don't come back on reload
	markSent: (id: string) => void;
	unmarkSent: (id: string) => void;
	remove: (id: string) => void;
	replaceAll: (rows: JobRow[]) => void;
	clearAll: () => void;
}

const patchRow = (rows: JobRow[], id: string, patch: Partial<JobRow>) =>
	rows.map((r) => (r.id === id ? { ...r, ...patch, updatedAt: new Date().toISOString() } : r));

export const useJobs = create<JobsState>()(
	persist(
		(set) => ({
			rows: newLeads([], []),
			dismissedLeads: [],
			markSent: (id) => set((s) => ({ rows: patchRow(s.rows, id, { status: 'applied', appliedAt: today() }) })),
			unmarkSent: (id) => set((s) => ({ rows: patchRow(s.rows, id, { status: 'todo', appliedAt: '' }) })),
			remove: (id) =>
				set((s) => {
					const leadId = s.rows.find((r) => r.id === id)?.leadId;
					return {
						rows: s.rows.filter((r) => r.id !== id),
						dismissedLeads: leadId ? [...s.dismissedLeads, leadId] : s.dismissedLeads,
					};
				}),
			replaceAll: (rows) => set({ rows: rows.map((r) => blankRow(r)) }),
			// Deletes everything and dismisses every known lead, so leads.json doesn't re-add them on reload.
			clearAll: () =>
				set((s) => ({
					rows: [],
					dismissedLeads: [...new Set([...s.dismissedLeads, ...s.rows.flatMap((r) => r.leadId ?? []), ...leadIds])],
				})),
		}),
		{
			// Different key and port (5180) than the personal app, so the two never share data.
			name: 'jobhunt-local.jobs.v1',
			version: 1,
			// New leads from leads.json are added on top. Unsent leads that disappeared from leads.json disappear here too.
			merge: (persisted, current) => {
				const s = { ...current, ...(persisted as Partial<JobsState>) };
				const kept = s.rows.filter((r) => !r.leadId || leadIds.has(r.leadId) || isSent(r));
				// Refresh lead fields (e.g. fit, notes) from the file for unsent rows, keep the user's status.
				const byId = new Map(leads.map((l) => [l.leadId, l]));
				const refreshed = kept.map((r) => {
					const l = r.leadId ? byId.get(r.leadId) : undefined;
					return l && !isSent(r) ? { ...r, ...fromLead(l), id: r.id } : r;
				});
				return { ...s, rows: [...newLeads(refreshed, s.dismissedLeads), ...refreshed] };
			},
		}
	)
);

// ---------- E-mail ----------

const fill = (tpl: string, r: JobRow) =>
	tpl
		.replaceAll('{position}', r.position || 'the position')
		.replaceAll('{company}', r.company || 'your company')
		.replaceAll('{name}', profile?.name ?? '')
		.replaceAll('{contactName}', r.contactName || '');

// mailto: cannot carry attachments, so the CV is attached manually in the mail client.
export function mailtoHref(r: JobRow) {
	const tpl = profile?.emailTemplate ?? { subject: 'Application: {position}', body: 'Hello,\n\n…\n\n{name}' };
	return `mailto:${r.email}?subject=${encodeURIComponent(fill(tpl.subject, r))}&body=${encodeURIComponent(fill(tpl.body, r))}`;
}
