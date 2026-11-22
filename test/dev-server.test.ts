// JL-02: the dev server must not hand the CV, other profile files or dist/ to anyone, nor allow cross-origin reads.
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { createServer, normalizePath, type ViteDevServer } from 'vite';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

let server: ViteDevServer;
let base = '';
const distProbe = 'dist/__dev-server-test.txt';
// Only remove dist/ afterwards if the test created it.
const hadDist = existsSync('dist');

beforeAll(async () => {
	mkdirSync('dist', { recursive: true });
	writeFileSync(distProbe, 'x');
	// Own cache and no dependency scan, so it never disturbs a running `pnpm dev`.
	server = await createServer({
		server: { port: 0, strictPort: false },
		cacheDir: 'node_modules/.vite-test',
		optimizeDeps: { noDiscovery: true, include: [] },
		logLevel: 'silent',
	});
	await server.listen();
	base = server.resolvedUrls!.local[0]!.replace(/\/$/, '');
});

afterAll(async () => {
	await server?.close();
	rmSync(hadDist ? distProbe : 'dist', { recursive: true, force: true });
});

const status = async (path: string) => (await fetch(base + path)).status;

describe('dev server', () => {
	it('denies the CV and other non-JSON profile files', async () => {
		expect(await status('/profile/example/cv.md')).toBe(403);
		// Vite's /@fs/ form of an absolute path: /@fs/Users/… on macOS and Linux, /@fs/D:/… on Windows.
		const abs = normalizePath(process.cwd()).replace(/^\//, '');
		expect(await status(`/@fs/${abs}/profile/example/cv.md`)).toBe(403);
	});

	it('denies dist/', async () => expect(await status(`/${distProbe}`)).toBe(403));

	it('still serves the app, the Vite client and the example JSON', async () => {
		expect(await status('/src/main.tsx')).toBe(200);
		expect(await status('/profile/example/leads.json?import')).toBe(200);
		// A deny rule that is too broad (like **/dist/**) blocks Vite's own client and leaves a blank page.
		const client = await fetch(`${base}/@vite/client`);
		expect(client.headers.get('content-type')).toContain('javascript');
	});

	it('sends no CORS header to other origins', async () => {
		const res = await fetch(`${base}/src/main.tsx`, { headers: { Origin: 'http://localhost:3000' } });
		expect(res.headers.get('access-control-allow-origin')).toBeNull();
	});
});
