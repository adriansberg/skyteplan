<script lang="ts">
	import { page } from '$app/state';
	import ErrorBlock from '$lib/components/ErrorBlock.svelte';
</script>

<div class="container mx-auto max-w-2xl px-4 py-12">
	<ErrorBlock
		message={page.error?.message ?? 'Sjekk nettforbindelsen og prøv igjen.'}
		retry={() => window.location.reload()}
	/>
	<a href="/" class="mt-6 inline-block text-sm text-primary hover:underline">← Gå til forsiden</a>
</div>
