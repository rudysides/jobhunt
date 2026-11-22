import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [react()],
	// Local only: bound to 127.0.0.1. Fixed port because localStorage belongs to the origin;
	// a different port means an empty app. 5180 so it never collides with other local apps on 5173.
	server: {
		host: '127.0.0.1',
		port: 5180,
		strictPort: true,
		// No other origin (another localhost app, a page you visit) may read from this server.
		cors: false,
		fs: {
			// Vite's defaults, then everything in profile/ except the JSON the app imports (the CV), and dist/.
			deny: ['.env', '.env.*', '*.{crt,pem}', '**/.git/**', '**/profile/**/!(*.json)', '**/dist/**'],
		},
	},
	// Not deployable by design: profile/*.json is bundled at build time. `pnpm build` is a compile check
	// and writes nothing, so no dist/ with personal data can end up shared.
	build: { write: false },
});
