import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { today } from './ui/lib/date';
import { leads, profile, type Lead } from './profile';
import { cleanText, isEmail, isHttpUrl } from './validate.ts';

/** Where an application stands. `todo` is not sent yet, the rest follow it after it was sent. */
export const STATUSES = ['todo', 'applied', 'interview', 'offer', 'rejected', 'withdrawn'] as const;
export type Status = (typeof STATUSES)[number];
/** The stages a sent job can move between, in pipeline order. */
export const STAGES = ['applied', 'interview', 'offer', 'rejected', 'withdrawn'] as const satisfies Status[];
export type Stage = (typeof STAGES)[number];

/** The list tabs: rejected and withdrawn share one "closed" list. */
export const GROUPS = ['todo', 'applied', 'interview', 'offer', 'closed'] as const;
export type Group = (typeof GROUPS)[number];
export const groupOf = (s: Status): Group => (s === 'rejected' || s === 'withdrawn' ? 'closed' : s);

/** One stamp in a job's trail: the stage it moved to and the day it did. */
export interface StageStep {
	status: Stage;
	on: string; // YYYY-MM-DD
}

const isStatus = (v: unknown): v is Status => STATUSES.includes(v as Status);
const isYmd = (v: unknown): v is string => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);

export interface JobRow extends Omit<Lead, 'leadId' | 'foundAt'> {
	id: string;
	leadId: string | null; // from profile/leads.json
	status: Status;
	appliedAt: string; // YYYY-MM-DD
	updatedAt: string;
	myNotes: string; // the user's own note, never touched by leads.json
	history: StageStep[]; // every stage change after To apply, oldest first
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
		myNotes: '',
		history: [],
		updatedAt: new Date().toISOString(),
		...partial,
	};
}

const fromLead = ({ foundAt: _, ...l }: Lead) => blankRow(l);

const TEXT_FIELDS = [
	'company',
	'position',
	'location',
	'contactName',
	'role',
	'source',
	'salary',
	'notes',
	'myNotes',
] as const;

/**
 * A row from an imported backup, checked and cleaned (JL-04). Only known fields are kept, text loses control
 * characters and is capped, e-mails and links that fail the lead rules are dropped. Null when it isn't a row at all.
 */
export function normalizeRow(v: unknown): JobRow | null {
	if (!v || typeof v !== 'object' || Array.isArray(v)) return null;
	const r = v as Record<string, unknown>;
	if (!isStatus(r.status)) return null;
	const text = Object.fromEntries(
		TEXT_FIELDS.map((k) => [k, cleanText(r[k], k === 'notes' || k === 'myNotes' ? 5000 : 300)])
	);
	const email = cleanText(r.email, 254);
	const jobUrl = cleanText(r.jobUrl, 2048);
	const fit =
		Number.isInteger(r.fit) && (r.fit as number) >= 1 && (r.fit as number) <= 5 ? (r.fit as number) : undefined;
	const appliedAt = isYmd(r.appliedAt) ? r.appliedAt : '';
	const history = Array.isArray(r.history)
		? r.history
				.filter(
					(h): h is StageStep => !!h && typeof h === 'object' && STAGES.includes(h.status) && isYmd((h as StageStep).on)
				)
				.slice(-50)
				.map(({ status, on }) => ({ status, on }))
		: historyFallback(r.status, appliedAt);
	return blankRow({
		...text,
		id: typeof r.id === 'string' && r.id ? cleanText(r.id, 100) : crypto.randomUUID(),
		leadId: typeof r.leadId === 'string' && /^[a-z0-9-]{1,200}$/.test(r.leadId) ? r.leadId : null,
		email: isEmail(email) ? email : '',
		jobUrl: isHttpUrl(jobUrl) ? jobUrl : '',
		status: r.status,
		appliedAt,
		history: r.status === 'todo' ? [] : history,
		...(typeof r.updatedAt === 'string' &&
			!Number.isNaN(Date.parse(r.updatedAt)) && { updatedAt: cleanText(r.updatedAt, 40) }),
		...(fit && { fit }),
	});
}

/** Rows saved before stages existed: an applied row gets one stamp from its applied date. */
const historyFallback = (status: Status, appliedAt: string): StageStep[] =>
	status !== 'todo' && appliedAt ? [{ status: status as Stage, on: appliedAt }] : [];

/** Leads that are not in the list yet and were not dismissed. */
const newLeads = (rows: JobRow[], dismissed: string[], fileLeads: Lead[] = leads) => {
	const known = new Set([...rows.map((r) => r.leadId), ...dismissed]);
	return fileLeads.filter((l) => !known.has(l.leadId)).map(fromLead);
};

const leadIds = new Set(leads.map((l) => l.leadId));

interface JobsState {
	rows: JobRow[];
	dismissedLeads: string[]; // removed leads, so they don't come back on reload
	markSent: (id: string) => void;
	setStage: (id: string, status: Status) => void;
	unmarkSent: (id: string) => void;
	remove: (id: string) => void;
	setNotes: (id: string, text: string) => void;
	add: (row: JobRow) => void;
	update: (id: string, patch: Partial<JobRow>) => void;
	restore: (row: JobRow, index: number) => void;
	replaceAll: (rows: JobRow[], dismissedLeads?: string[]) => void;
	clearAll: () => void;
}

type Stored = Pick<JobsState, 'rows' | 'dismissedLeads'>;

/**
 * Upgrades saved state from older versions. v1 → v2: rows got the user's own note. v2 → v3: rows got a stage
 * history, applied rows start it with their applied date.
 */
export function migrateStored(persisted: unknown, version: number): Partial<Stored> {
	let s = (persisted ?? {}) as Partial<Stored>;
	if (version < 2) s = { ...s, rows: (s.rows ?? []).map((r) => ({ ...r, myNotes: r.myNotes ?? '' })) };
	if (version < 3)
		s = {
			...s,
			rows: (s.rows ?? []).map((r) => ({ ...r, history: r.history ?? historyFallback(r.status, r.appliedAt) })),
		};
	return s;
}

/** The patch for moving a row to `status` today. Back to To apply clears the date and the trail. */
function stagePatch(r: JobRow, status: Status): Partial<JobRow> {
	if (status === 'todo') return { status, appliedAt: '', history: [] };
	if (status === r.status) return {};
	const on = today();
	return {
		status,
		appliedAt: r.appliedAt || on,
		history: [...r.history, { status, on }],
	};
}

/**
 * Saved state + leads.json on load. New leads go on top, dismissed ones never come back, unsent rows whose lead
 * disappeared go away, unsent rows refresh their lead fields (keeping the user's note), applied rows stay as they are.
 */
export function mergeStored(
	persisted: Partial<Stored> | undefined,
	current: Stored,
	fileLeads: Lead[] = leads
): Stored {
	const s = { ...current, ...persisted };
	const ids = new Set(fileLeads.map((l) => l.leadId));
	const kept = s.rows.filter((r) => !r.leadId || ids.has(r.leadId) || isSent(r));
	const byId = new Map(fileLeads.map((l) => [l.leadId, l]));
	const refreshed = kept.map((r) => {
		const l = r.leadId ? byId.get(r.leadId) : undefined;
		// fromLead would blank the user's own note, so keep it.
		return l && !isSent(r) ? { ...r, ...fromLead(l), id: r.id, myNotes: r.myNotes } : r;
	});
	return {
		rows: [...newLeads(refreshed, s.dismissedLeads, fileLeads), ...refreshed],
		dismissedLeads: s.dismissedLeads,
	};
}

const patchRow = (rows: JobRow[], id: string, patch: Partial<JobRow>) =>
	rows.map((r) => (r.id === id ? { ...r, ...patch, updatedAt: new Date().toISOString() } : r));

export const useJobs = create<JobsState>()(
	persist(
		(set, get) => ({
			rows: newLeads([], []),
			dismissedLeads: [],
			setStage: (id, status) =>
				set((s) => {
					const r = s.rows.find((x) => x.id === id);
					return r && r.status !== status ? { rows: patchRow(s.rows, id, stagePatch(r, status)) } : s;
				}),
			markSent: (id) => get().setStage(id, 'applied'),
			unmarkSent: (id) => get().setStage(id, 'todo'),
			setNotes: (id, text) => set((s) => ({ rows: patchRow(s.rows, id, { myNotes: text }) })),
			// A job the user added by hand (leadId null): on top, and leads.json never touches it.
			add: (row) => set((s) => ({ rows: [row, ...s.rows] })),
			update: (id, patch) => set((s) => ({ rows: patchRow(s.rows, id, patch) })),
			remove: (id) =>
				set((s) => {
					const leadId = s.rows.find((r) => r.id === id)?.leadId;
					return {
						rows: s.rows.filter((r) => r.id !== id),
						dismissedLeads: leadId ? [...s.dismissedLeads, leadId] : s.dismissedLeads,
					};
				}),
			// Undo of remove: back at its old place, and its lead is no longer dismissed.
			restore: (row, index) =>
				set((s) => ({
					rows: s.rows.some((r) => r.id === row.id) ? s.rows : s.rows.toSpliced(index, 0, row),
					dismissedLeads: s.dismissedLeads.filter((l) => l !== row.leadId),
				})),
			// Rows come from normalizeRow. Older backups have no dismissedLeads: keep the current ones.
			replaceAll: (rows, dismissedLeads) => set((s) => ({ rows, dismissedLeads: dismissedLeads ?? s.dismissedLeads })),
			// Deletes everything and dismisses every known lead, so leads.json doesn't re-add them on reload.
			clearAll: () =>
				set((s) => ({
					rows: [],
					dismissedLeads: [...new Set([...s.dismissedLeads, ...s.rows.flatMap((r) => r.leadId ?? []), ...leadIds])],
				})),
		}),
		{
			// Changing the key or the port (5180) means an empty app; bump `version` and migrate instead.
			name: 'jobhunt-local.jobs.v1',
			version: 3,
			migrate: (persisted, version) => migrateStored(persisted, version) as JobsState,
			merge: (persisted, current) => ({ ...current, ...mergeStored(persisted as Stored, current) }),
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
