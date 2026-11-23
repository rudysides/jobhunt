import { beforeEach, describe, expect, it } from 'vitest';
import type { Lead } from '../src/profile.ts';
import { mailtoHref, mergeStored, migrateStored, normalizeRow, useJobs, type JobRow } from '../src/store.ts';

const lead = (leadId: string, extra: Partial<Lead> = {}): Lead => ({
	leadId,
	company: leadId,
	position: 'Dev',
	location: '',
	contactName: '',
	role: '',
	email: '',
	source: '',
	jobUrl: '',
	salary: '',
	notes: '',
	foundAt: '2026-01-01',
	...extra,
});

const row = (leadId: string | null, extra: Partial<JobRow> = {}) =>
	({ ...normalizeRow({ status: 'todo', company: leadId ?? 'manual' })!, leadId, ...extra }) as JobRow;

const empty = { rows: [], dismissedLeads: [] };
const ids = () => useJobs.getState().rows.map((r) => r.leadId);

describe('mergeStored (saved state + leads.json on load)', () => {
	it('adds new leads on top', () => {
		const s = mergeStored({ rows: [row('a')], dismissedLeads: [] }, empty, [lead('a'), lead('b')]);
		expect(s.rows.map((r) => r.leadId)).toEqual(['b', 'a']);
	});

	it('never brings back a removed lead', () => {
		const s = mergeStored({ rows: [], dismissedLeads: ['a'] }, empty, [lead('a')]);
		expect(s.rows).toEqual([]);
	});

	it('keeps applied rows when their lead disappears, drops unsent ones', () => {
		const s = mergeStored({ rows: [row('gone'), row('sent', { status: 'applied' })], dismissedLeads: [] }, empty, []);
		expect(s.rows.map((r) => r.leadId)).toEqual(['sent']);
	});

	it('keeps rows without a lead', () => {
		expect(mergeStored({ rows: [row(null)], dismissedLeads: [] }, empty, []).rows).toHaveLength(1);
	});

	it('refreshes unsent rows from leads.json but keeps id and the own note', () => {
		const saved = row('a', { notes: 'old', myNotes: 'called them', fit: 2 });
		const [r] = mergeStored({ rows: [saved], dismissedLeads: [] }, empty, [lead('a', { notes: 'new', fit: 5 })]).rows;
		expect(r).toMatchObject({ id: saved.id, notes: 'new', fit: 5, myNotes: 'called them' });
	});

	it('leaves applied rows as they are', () => {
		const saved = row('a', { status: 'applied', notes: 'old' });
		expect(
			mergeStored({ rows: [saved], dismissedLeads: [] }, empty, [lead('a', { notes: 'new' })]).rows[0]!.notes
		).toBe('old');
	});
});

describe('migrateStored', () => {
	it('v1 rows get an empty own note', () => {
		const s = migrateStored({ rows: [{ id: 'x', status: 'todo' }], dismissedLeads: [] }, 1);
		expect(s.rows![0]!.myNotes).toBe('');
	});
	it('leaves current data alone', () => {
		const data = { rows: [row('a', { myNotes: 'n' })], dismissedLeads: [] };
		expect(migrateStored(data, 2)).toEqual(data);
	});
});

describe('normalizeRow (imported backups)', () => {
	it('rejects things that are not rows', () => {
		for (const v of [null, 'x', [], {}, { status: 'sent' }]) expect(normalizeRow(v)).toBeNull();
	});
	it('drops unknown fields, bad e-mails and links, cleans text', () => {
		const r = normalizeRow({
			status: 'applied',
			company: 'Acme\u0000',
			email: 'a@b.c?cc=x',
			jobUrl: 'javascript:alert(1)',
			fit: 42,
			evil: '<script>',
			appliedAt: 'yesterday',
		})!;
		expect(r).toMatchObject({ company: 'Acme', email: '', jobUrl: '', status: 'applied', appliedAt: '', myNotes: '' });
		expect(r).not.toHaveProperty('evil');
		expect(r.fit).toBeUndefined();
	});
	it('keeps valid data', () => {
		const r = normalizeRow({
			status: 'todo',
			leadId: 'acme-dev',
			email: 'jobs@acme.cz',
			jobUrl: 'https://a.cz/1',
			fit: 4,
		})!;
		expect(r).toMatchObject({ leadId: 'acme-dev', email: 'jobs@acme.cz', jobUrl: 'https://a.cz/1', fit: 4 });
	});
});

describe('store actions', () => {
	beforeEach(() => useJobs.setState({ rows: [row('a'), row('b'), row('c')], dismissedLeads: [] }));

	it('remove dismisses the lead, undo puts it back in place', () => {
		const { rows, remove, restore } = useJobs.getState();
		const b = rows[1]!;
		remove(b.id);
		expect(ids()).toEqual(['a', 'c']);
		expect(useJobs.getState().dismissedLeads).toEqual(['b']);
		restore(b, 1);
		expect(ids()).toEqual(['a', 'b', 'c']);
		expect(useJobs.getState().dismissedLeads).toEqual([]);
		restore(b, 1); // a second undo doesn't duplicate it
		expect(ids()).toEqual(['a', 'b', 'c']);
	});

	it('mark applied, add a note, unmark', () => {
		const id = useJobs.getState().rows[0]!.id;
		useJobs.getState().markSent(id);
		useJobs.getState().setNotes(id, 'interview Monday');
		expect(useJobs.getState().rows[0]).toMatchObject({ status: 'applied', myNotes: 'interview Monday' });
		expect(useJobs.getState().rows[0]!.appliedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
		useJobs.getState().unmarkSent(id);
		expect(useJobs.getState().rows[0]).toMatchObject({ status: 'todo', appliedAt: '', myNotes: 'interview Monday' });
	});

	it('delete all dismisses every known lead', () => {
		useJobs.getState().clearAll();
		const { rows, dismissedLeads } = useJobs.getState();
		expect(rows).toEqual([]);
		expect(dismissedLeads).toEqual(expect.arrayContaining(['a', 'b', 'c', 'example-co-junior-frontend']));
	});

	it('import replaces rows, keeps removed leads when the backup has none', () => {
		useJobs.getState().remove(useJobs.getState().rows[0]!.id);
		useJobs.getState().replaceAll([row('z')]);
		expect(ids()).toEqual(['z']);
		expect(useJobs.getState().dismissedLeads).toEqual(['a']);
		useJobs.getState().replaceAll([row('z')], ['q']);
		expect(useJobs.getState().dismissedLeads).toEqual(['q']);
	});
	it('adds a job by hand on top; leads.json, removing and a backup round trip leave it alone', () => {
		const own = normalizeRow({ status: 'todo', company: 'Own Co', position: 'Dev', leadId: null, email: 'bad@' })!;
		expect(own.email).toBe('');
		useJobs.getState().add(own);
		expect(ids()).toEqual([null, 'a', 'b', 'c']);
		useJobs.getState().update(own.id, { position: 'Frontend Dev' });
		expect(useJobs.getState().rows[0]).toMatchObject({ company: 'Own Co', position: 'Frontend Dev', leadId: null });

		const merged = mergeStored(useJobs.getState(), empty, [lead('a'), lead('b'), lead('c'), lead('d')]);
		expect(merged.rows.map((r) => r.leadId)).toEqual(['d', null, 'a', 'b', 'c']);

		const restored = JSON.parse(JSON.stringify(useJobs.getState().rows)).map(normalizeRow);
		expect(restored[0]).toMatchObject({ id: own.id, company: 'Own Co', leadId: null });

		useJobs.getState().remove(own.id);
		expect(useJobs.getState().dismissedLeads).toEqual([]);
	});
});

describe('mailtoHref', () => {
	it('encodes subject and body so nothing can add parameters', () => {
		const href = mailtoHref(row('a', { email: 'jobs@acme.cz', position: 'Dev&cc=evil@x.cz', company: 'Acme' }));
		expect(href.startsWith('mailto:jobs@acme.cz?subject=')).toBe(true);
		expect(href).not.toContain('&cc=');
		expect(new URL(href).searchParams.get('subject')).toBe('Application: Dev&cc=evil@x.cz');
	});
});
