import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

const script = resolve('src/check-leads.ts');
const example = (name: string) => resolve('profile/example', name);
let dir = '';

// Runs `pnpm leads:check` in a temp folder with the given profile/ files.
function check(files: Record<string, unknown>) {
	dir = mkdtempSync(join(tmpdir(), 'jobhunt-check-'));
	mkdirSync(join(dir, 'profile'));
	for (const [name, data] of Object.entries(files))
		writeFileSync(join(dir, 'profile', name), typeof data === 'string' ? data : JSON.stringify(data));
	try {
		return { ok: true, out: execFileSync('node', [script], { cwd: dir, encoding: 'utf8', stdio: 'pipe' }) };
	} catch (e) {
		return { ok: false, out: String((e as { stderr: string }).stderr) };
	}
}

afterEach(() => rmSync(dir, { recursive: true, force: true }));

const readJson = async (path: string) =>
	JSON.parse(await import('node:fs/promises').then((f) => f.readFile(path, 'utf8')));

describe('leads:check', () => {
	it('passes a fresh clone without a profile', () => expect(check({})).toMatchObject({ ok: true }));

	it('passes the example data', async () => {
		const r = check({
			'profile.json': await readJson(example('profile.json')),
			'leads.json': await readJson(example('leads.json')),
		});
		expect(r.ok).toBe(true);
	});

	it('fails on broken JSON, duplicates and JL-03/JL-05 payloads', async () => {
		const [good] = await readJson(example('leads.json'));
		expect(check({ 'leads.json': '[{' }).out).toContain('invalid JSON');
		const r = check({
			'leads.json': [
				good,
				good,
				{ ...good, leadId: 'x-1', jobUrl: 'javascript:alert(1)', email: 'a@b.cz?cc=evil@x.cz' },
			],
		});
		expect(r.ok).toBe(false);
		expect(r.out).toContain('duplicate leadId');
		expect(r.out).toContain('jobUrl must be an http(s) link');
		expect(r.out).toContain('email is not a plain address');
	});
});
