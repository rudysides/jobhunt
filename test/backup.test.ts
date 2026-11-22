import { describe, expect, it } from 'vitest';
import { readBackupFile } from '../src/ui/lib/backup.ts';
import { normalizeRow, type JobRow } from '../src/store.ts';

const file = (data: unknown) => new File([typeof data === 'string' ? data : JSON.stringify(data)], 'backup.json');
const read = (data: unknown) => readBackupFile(file(data), normalizeRow);

describe('readBackupFile', () => {
	const rows = [normalizeRow({ status: 'applied', company: 'Acme', myNotes: 'note' }) as JobRow];

	it('round-trips the current format', async () => {
		const backup = JSON.parse(JSON.stringify({ version: 2, exportedAt: 'now', rows, dismissedLeads: ['x'] }));
		const back = await read(backup);
		expect(back.rows).toEqual(rows);
		expect(back.dismissedLeads).toEqual(['x']);
	});

	it('reads older backups: { rows } and bare arrays, without dismissedLeads', async () => {
		expect((await read({ exportedAt: 'then', rows })).dismissedLeads).toBeUndefined();
		expect((await read(rows)).rows).toHaveLength(1);
	});

	it('rejects broken files as a whole', async () => {
		await expect(read('{not json')).rejects.toThrow();
		await expect(read({ jobs: [] })).rejects.toThrow('missing rows array');
		await expect(read([...rows, { status: 'nope' }])).rejects.toThrow('row 2 is not a job');
	});
});
