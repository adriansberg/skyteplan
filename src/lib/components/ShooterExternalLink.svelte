<script lang="ts">
	interface Props {
		shooterName: string;
		class?: string;
	}

	let { shooterName, class: className = '' }: Props = $props();
	const year = new Date().getFullYear();
</script>

<a
	href="https://{year}.lsres.no/search/?s={encodeURIComponent(shooterName)}"
	target="_blank"
	rel="noopener noreferrer"
	class="flex-shrink-0 text-gray-400 transition-colors hover:text-blue-600 {className}"
	title="Se detaljer på lsres.no"
	aria-label="Se detaljer på lsres.no for {shooterName}"
>
	<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
		/>
	</svg>
</a>
