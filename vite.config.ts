import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, type Plugin } from 'vite';

function swVersionPlugin(): Plugin {
	let resolvedMode = 'development';
	return {
		name: 'sw-version',
		configResolved(config) {
			resolvedMode = config.mode;
		},
		buildStart() {
			const template = readFileSync('static/sw.template.js', 'utf-8');
			let version: string;
			if (resolvedMode === 'development') {
				version = 'skytterappen-dev';
			} else {
				let hash: string;
				try {
					hash = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
				} catch {
					const sha = process.env.VERCEL_GIT_COMMIT_SHA ?? 'unknown';
					hash = sha.slice(0, 7);
				}
				version = 'skytterappen-' + hash;
			}
			writeFileSync('static/sw.js', template.replace('__CACHE_VERSION__', version));
		}
	};
}

export default defineConfig({
	plugins: [swVersionPlugin(), tailwindcss(), sveltekit()]
});
