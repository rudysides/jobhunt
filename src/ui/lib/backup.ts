import { today } from './date';

/** Downloads data as a `{prefix}-YYYY-MM-DD.json` file. */
export function downloadJson(data: unknown, prefix = 'jobhunt') {
	const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
	const a = document.createElement('a');
	a.href = URL.createObjectURL(blob);
	a.download = `${prefix}-${today()}.json`;
	a.click();
	// Revoking right after click() can cancel the download in some browsers.
	setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/**
 * Reads a backup: `{ version, exportedAt, rows, dismissedLeads }`, or the older `{ rows }` and bare arrays.
 * `normalize` checks each row; one bad row rejects the whole file, so nothing half-imported is saved.
 */
export async function readBackupFile<T>(file: File, normalize: (v: unknown) => T | null) {
	if (file.size > 20_000_000) throw new Error('file is too large');
	const data: unknown = JSON.parse(await file.text());
	const obj = (data && typeof data === 'object' ? data : {}) as { rows?: unknown; dismissedLeads?: unknown };
	const raw = Array.isArray(data) ? data : obj.rows;
	if (!Array.isArray(raw)) throw new Error('missing rows array');
	const rows = raw.map((v, i) => {
		const row = normalize(v);
		if (!row) throw new Error(`row ${i + 1} is not a job`);
		return row;
	});
	const d = obj.dismissedLeads;
	const dismissedLeads = Array.isArray(d) ? d.filter((x): x is string => typeof x === 'string') : undefined;
	return { rows, dismissedLeads };
}
