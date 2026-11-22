import { today } from './date';

/** Downloads data as a `{prefix}-YYYY-MM-DD.json` file. */
export function downloadJson(data: unknown, prefix = 'jobhunt') {
	const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
	const a = document.createElement('a');
	a.href = URL.createObjectURL(blob);
	a.download = `${prefix}-${today()}.json`;
	a.click();
	URL.revokeObjectURL(a.href);
}

/** Reads rows from a backup: either a bare array or `{ rows: [...] }`. */
export async function readRowsFile<T>(file: File): Promise<T[]> {
	const data = JSON.parse(await file.text());
	const rows: T[] = Array.isArray(data) ? data : data.rows;
	if (!Array.isArray(rows)) throw new Error('missing rows array');
	return rows;
}
