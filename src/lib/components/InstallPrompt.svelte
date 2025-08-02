<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	let showInstallPrompt = $state(false);
	let deferredPrompt: Event | null = null;

	onMount(() => {
		if (!browser) return;

		// Listen for the install prompt
		window.addEventListener('beforeinstallprompt', (e) => {
			e.preventDefault();
			deferredPrompt = e;
			showInstallPrompt = true;
		});

		// Hide prompt after installation
		window.addEventListener('appinstalled', () => {
			showInstallPrompt = false;
			deferredPrompt = null;
		});

		// Check if already installed (standalone mode)
		if (window.matchMedia('(display-mode: standalone)').matches) {
			showInstallPrompt = false;
		}
	});

	function installApp() {
		if (deferredPrompt) {
			// Show the install prompt
			(deferredPrompt as any).prompt();

			// Wait for the user to respond to the prompt
			(deferredPrompt as any).userChoice.then((choiceResult: any) => {
				if (choiceResult.outcome === 'accepted') {
					console.log('User accepted the install prompt');
				} else {
					console.log('User dismissed the install prompt');
				}
				deferredPrompt = null;
				showInstallPrompt = false;
			});
		}
	}

	function dismissPrompt() {
		showInstallPrompt = false;
	}
</script>

{#if showInstallPrompt}
	<div
		class="fixed right-4 bottom-4 left-4 z-50 mx-auto max-w-sm rounded-lg bg-gray-800 p-4 text-white shadow-lg"
	>
		<div class="flex items-start gap-3">
			<div class="flex-1">
				<h3 class="font-semibold">Installer appen</h3>
				<p class="mt-1 text-sm text-gray-300">
					Legg til Stordalen på hjemskjermen for rask tilgang
				</p>
			</div>
			<button onclick={dismissPrompt} class="text-gray-400 hover:text-white" aria-label="Lukk">
				<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
					<path
						fill-rule="evenodd"
						d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
						clip-rule="evenodd"
					/>
				</svg>
			</button>
		</div>
		<div class="mt-3 flex gap-2">
			<button
				onclick={installApp}
				class="flex-1 rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
			>
				Installer
			</button>
			<button
				onclick={dismissPrompt}
				class="rounded border border-gray-600 px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700"
			>
				Ikke nå
			</button>
		</div>
	</div>
{/if}
