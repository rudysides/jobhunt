import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig, normalizePath } from 'vite';

// Absolute, so the rules hit this project's folders only, never a package's own dist/ in node_modules.
const own = (path: string) => normalizePath(fileURLToPath(new URL(path, import.meta.url)));

export default defineConfig(({ mode }) => ({
	plugins: [react()],
	// Separate dependency caches, so `pnpm dev` and `pnpm demo` can run side by side.
	cacheDir: mode === 'demo' ? 'node_modules/.vite-demo' : 'node_modules/.vite',
	// Local only: bound to 127.0.0.1. Fixed port because localStorage belongs to the origin;
	// a different port means an empty app. 5180 so it never collides with other local apps on 5173.
	// `pnpm demo` gets its own port (and so its own storage), so it never touches your data.
	server: {
		host: '127.0.0.1',
		port: mode === 'demo' ? 5181 : 5180,
		strictPort: true,
		// No other origin (another localhost app, a page you visit) may read from this server.
		cors: false,
		fs: {
			// Vite's defaults, then everything in profile/ except the JSON the app imports (the CV), and dist/.
			deny: ['.env', '.env.*', '*.{crt,pem}', '**/.git/**', `${own('profile')}/**/!(*.json)`, `${own('dist')}/**`],
		},
	},
	// Not deployable by design: profile/*.json is bundled at build time. `pnpm build` is a compile check
	// and writes nothing, so no dist/ with personal data can end up shared.
	build: { write: false },
	test: { include: ['test/**/*.test.ts'] },
}));
