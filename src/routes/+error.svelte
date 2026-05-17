<script lang="ts">
	import stordalenLogo from '$lib/assets/stordalen.jpg';
	import { page } from '$app/state';
</script>

<header class="sticky top-0 z-40 border-b border-gray-200 bg-white">
	<div class="container mx-auto flex items-center justify-between px-2 py-2 sm:px-4 sm:py-3">
		<a href="/" class="flex items-center space-x-2 transition-opacity hover:opacity-80">
			<img src={stordalenLogo} alt="Stordalen Skytterlag" class="h-8 w-auto sm:h-10" />
			<span class="hidden text-lg font-semibold text-gray-900 sm:inline">Stordalen Skytterlag</span>
		</a>
	</div>
</header>

<div class="m-6 rounded-lg border border-red-200 bg-red-50 p-6">
	<h2 class="mb-2 text-xl font-semibold text-red-800">
		Kunne ikke laste data. Sjekk nettforbindelsen og prøv igjen.
	</h2>
	{#if page.error?.message}
		<p class="mt-2 text-sm text-red-500">{page.error.message}</p>
	{/if}
	<a href="/" class="mt-4 inline-block text-sm text-blue-600 hover:underline">Gå til forsiden</a>
</div>
