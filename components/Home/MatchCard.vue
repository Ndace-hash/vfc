<template>
	<article
		class="flex flex-col rounded-2xl bg-default p-5 shadow-sm ring-1 ring-default md:p-6"
		:aria-labelledby="headingId"
	>
		<header class="flex items-center justify-between gap-2">
			<h3
				:id="headingId"
				class="text-sm font-semibold uppercase tracking-wide text-muted"
			>
				{{ kind === "result" ? "Last result" : "Next fixture" }}
			</h3>
			<div class="flex gap-1.5">
				<UBadge
					v-if="outcome"
					:color="outcome === 'Win' ? 'primary' : 'neutral'"
					variant="subtle"
					>{{ outcome }}</UBadge
				>
				<UBadge v-if="side" color="neutral" variant="outline">{{ side }}</UBadge>
			</div>
		</header>

		<div class="mt-5 grid grid-cols-[1fr_auto_1fr] items-start gap-3">
			<div
				v-for="team in [game.home, game.away]"
				:key="team.name"
				class="flex flex-col items-center gap-2 text-center"
				:class="team === game.away ? 'order-3' : ''"
			>
				<TeamCrest
					:name="team.name"
					:crest-url="team.crest_url"
					class="size-16 md:size-20"
				/>
				<p class="text-sm font-semibold text-highlighted text-balance">
					{{ team.name }}
				</p>
			</div>

			<div class="order-2 flex min-w-20 flex-col items-center pt-4 md:pt-5">
				<template v-if="kind === 'result'">
					<p
						class="text-4xl font-bold tabular-nums text-highlighted md:text-5xl"
						:aria-label="`${game.home.name} ${game.goals.home}, ${game.away.name} ${game.goals.away}`"
					>
						{{ game.goals.home
						}}<span class="mx-1.5 text-dimmed" aria-hidden="true">–</span
						>{{ game.goals.away }}
					</p>
					<p class="mt-1 text-xs text-muted">Full time</p>
				</template>
				<template v-else>
					<p class="text-3xl font-bold tabular-nums text-highlighted md:text-4xl">
						{{ game.kickoff.time }}
					</p>
					<p class="mt-1 text-xs text-muted">Kick-off</p>
				</template>
			</div>
		</div>

		<p class="mt-5 text-center text-sm text-toned">
			<time :datetime="game.start_time">{{ game.kickoff.day }}</time>
		</p>
	</article>
</template>

<script setup lang="ts">
	import type { PublicFixture } from "~/types/Match";

	const props = defineProps<{
		kind: "result" | "fixture";
		game: PublicFixture;
	}>();

	const headingId = useId();

	const isUs = (team: { name: string }) => isSameTeamName(team.name, CLUB_NAME);

	// from Valiant FC's side; empty when neither team is Valiant FC
	const side = computed(() =>
		isUs(props.game.home) ? "Home" : isUs(props.game.away) ? "Away" : "",
	);

	const outcome = computed(() => {
		if (props.kind !== "result" || !side.value) return "";
		const { home, away } = props.game.goals;
		const ours = side.value === "Home" ? home - away : away - home;
		return ours > 0 ? "Win" : ours < 0 ? "Loss" : "Draw";
	});
</script>
