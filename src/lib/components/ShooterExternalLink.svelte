<script lang="ts">
	import { ExternalLink } from '@lucide/svelte';

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
	class="shrink-0 text-fg-muted transition-colors duration-200 hover:text-primary active:opacity-70 {className}"
	title="Se detaljer på lsres.no"
	aria-label="Se detaljer på lsres.no for {shooterName}"
>
	<ExternalLink size={14} aria-hidden="true" />
</a>
