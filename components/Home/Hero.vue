<template>
	<section
		aria-labelledby="matches-heading"
		class="mx-auto max-w-6xl px-4 pt-8 md:pt-12"
	>
		<div class="mb-5 flex items-center justify-between gap-4">
			<h2
				id="matches-heading"
				class="text-2xl font-bold text-highlighted md:text-3xl"
			>
				Matches
			</h2>
			<UButton
				to="/fixtures"
				variant="ghost"
				trailing-icon="i-bi-arrow-right"
				class="-me-2.5"
				>See all fixtures</UButton
			>
		</div>

		<div v-if="status === 'pending'" class="grid gap-4 md:grid-cols-2">
			<USkeleton v-for="n in 2" :key="n" class="h-64 rounded-2xl" />
		</div>

		<div
			v-else-if="last || next"
			class="grid gap-4"
			:class="last ? 'md:grid-cols-2' : 'max-w-xl'"
		>
			<HomeMatchCard v-if="last" kind="result" :game="last" />
			<HomeMatchCard v-if="next" kind="fixture" :game="next" />
			<div
				v-else
				class="flex min-h-48 flex-col items-center justify-center gap-2 rounded-2xl p-6 text-center ring-1 ring-default"
			>
				<UIcon name="i-bi-calendar-event" class="size-7 text-dimmed" />
				<p class="font-semibold text-highlighted">
					Next fixture to be announced
				</p>
				<p class="text-sm text-muted">Check back soon for the next match.</p>
			</div>
		</div>

		<!-- no matches at all yet, or they could not be loaded -->
		<div
			v-else
			class="flex flex-col items-center gap-3 rounded-2xl px-6 py-12 text-center ring-1 ring-default"
		>
			<img src="/valiant.png" alt="" class="size-20" />
			<p class="text-xl font-bold text-highlighted">{{ CLUB_NAME }}</p>
			<p class="max-w-sm text-sm text-muted">
				Results and fixtures will appear here once the season’s schedule is
				announced.
			</p>
		</div>
	</section>
</template>

<script setup lang="ts">
	import type { PublicFixture } from "~/types/Match";

	// [upcoming, soonest first; past, most recent first]
	const { data, status } = useFetch<[PublicFixture[], PublicFixture[]]>(
		"/api/get-fixtures",
		{ default: () => [[], []] },
	);

	// the list holds every team's matches; the hero is about Valiant FC's
	const isOurs = (game: PublicFixture) =>
		isSameTeamName(game.home.name, CLUB_NAME) ||
		isSameTeamName(game.away.name, CLUB_NAME);

	const next = computed(() => data.value?.[0]?.find(isOurs));
	// a match that has kicked off but has no score entered yet is skipped
	const last = computed(() =>
		data.value?.[1]?.find((game) => game.played && isOurs(game)),
	);
</script>
