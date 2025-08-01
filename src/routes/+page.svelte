<script>
	import { useQuery } from '@sveltestack/svelte-query';
	import { getShootersByClub } from '$lib';

	// Use svelte-query with the GraphQL client that has built-in auth headers
	const shooters = useQuery('shooters', () => getShootersByClub('10782'));

	console.log('shooters', shooters);
</script>

{#if $shooters.status === 'loading'}
	<div class="shooters">Loading shooters data...</div>
{:else if $shooters.status === 'error'}
	<div class="error">
		<h2>Error loading data:</h2>
		<span>Error: {$shooters.error}</span>
	</div>
{:else if $shooters.data}
	<div class="shooters">
		<h2>Shooters Data</h2>
		<div>
			<p>Total shooters: {$shooters.data.length || 'N/A'}</p>
		</div>
		<div>{$shooters.isFetching ? 'Background Updating...' : ''}</div>

		<!-- Display the first few shooters as an example -->
		{#if $shooters.data.length > 0}
			<details>
				<summary>View Raw Data (Click to expand)</summary>
				<pre>{JSON.stringify(
						$shooters.data.filter((d) => d.name.includes('Felicia')),
						null,
						2
					)}</pre>
				{#if $shooters.data.length > 3}
					<p>... and {$shooters.data.length - 3} more shooters</p>
				{/if}
			</details>
		{/if}
	</div>
{/if}

<style>
	.error {
		color: red;
		border: 1px solid red;
		padding: 1rem;
		margin: 1rem 0;
		border-radius: 4px;
		background-color: #ffe6e6;
	}

	.shooters {
		border: 1px solid #ccc;
		padding: 1rem;
		margin: 1rem;
		border-radius: 4px;
		background-color: #f9f9f9;
	}

	pre {
		background: #f5f5f5;
		padding: 1rem;
		border-radius: 4px;
		overflow-x: auto;
		max-height: 400px;
		font-size: 12px;
		border: 1px solid #ddd;
	}

	details summary {
		cursor: pointer;
		padding: 0.5rem;
		background: #e9e9e9;
		border-radius: 4px;
		margin-bottom: 0.5rem;
	}

	details[open] summary {
		margin-bottom: 1rem;
	}
</style>
