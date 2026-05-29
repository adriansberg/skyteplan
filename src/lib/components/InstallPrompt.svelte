<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Download, X } from '@lucide/svelte';

	interface BeforeInstallPromptEvent extends Event {
		prompt(): Promise<void>;
		userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
	}

	let showInstallPrompt = $state(false);
	let deferredPrompt: BeforeInstallPromptEvent | null = null;

	onMount(() => {
		if (!browser) return;

		window.addEventListener('beforeinstallprompt', (e) => {
			e.preventDefault();
			deferredPrompt = e as BeforeInstallPromptEvent;
			showInstallPrompt = true;
		});

		window.addEventListener('appinstalled', () => {
			showInstallPrompt = false;
			deferredPrompt = null;
		});

		if (window.matchMedia('(display-mode: standalone)').matches) {
			showInstallPrompt = false;
		}
	});

	function installApp() {
		if (!deferredPrompt) return;
		deferredPrompt.prompt();
		deferredPrompt.userChoice.then(() => {
			deferredPrompt = null;
			showInstallPrompt = false;
		});
	}

	function dismissPrompt() {
		showInstallPrompt = false;
	}
</script>

{#if showInstallPrompt}
	<div
		class="fixed right-4 left-4 z-50 mx-auto max-w-sm rounded-xl bg-stone-900 p-4 shadow-lg dark:bg-stone-800"
		style="bottom: calc(4rem + env(safe-area-inset-bottom) + 0.75rem)"
	>
		<div class="flex items-start gap-3">
			<div class="flex-1">
				<h3 class="font-semibold text-stone-50">Installer appen</h3>
				<p class="mt-1 text-sm text-stone-400">
					Legg til Skytterinfo på hjemskjermen for rask tilgang
				</p>
			</div>
			<button
				onclick={dismissPrompt}
				class="text-stone-400 transition-colors hover:text-stone-200 active:text-stone-200"
				aria-label="Lukk"
			>
				<X size={20} aria-hidden="true" />
			</button>
		</div>
		<div class="mt-3 flex gap-2">
			<button
				onclick={installApp}
				class="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90 active:opacity-80"
			>
				<Download size={14} aria-hidden="true" />
				Installer
			</button>
			<button
				onclick={dismissPrompt}
				class="rounded-lg border border-stone-700 px-3 py-2 text-sm font-medium text-stone-300 transition-colors hover:bg-stone-800 active:bg-stone-700"
			>
				Ikke nå
			</button>
		</div>
	</div>
{/if}
