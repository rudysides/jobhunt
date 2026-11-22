import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

// Local only: bound to 127.0.0.1. Fixed port because localStorage belongs to the origin;
// a different port means an empty app. 5180 so it never collides with other local apps on 5173.
const server = { host: '127.0.0.1', port: 5180, strictPort: true };

// Not deployable by design: profile/*.json is bundled at build time, so dist/ contains personal data.
// `pnpm build` is only a compile check, so warn instead of failing.
const localOnlyWarning: Plugin = {
	name: 'jobhunt-local:local-only-warning',
	apply: 'build',
	closeBundle() {
		this.warn('dist/ contains your profile/ data. It is a compile check only. Do not host or share it.');
	},
};

export default defineConfig({
	plugins: [react(), localOnlyWarning],
	server,
	preview: server,
});
