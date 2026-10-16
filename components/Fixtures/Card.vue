<template>
	<section class="flex items-center justify-center border-b-2 py-2 gap-6">
		<div class="flex flex-col justify-center">
			<TeamCrest
				:name="game.home.name"
				:crest-url="game.home.crest_url"
				class="w-[60px] h-[60px]"
			/>
		</div>
		<div
			class="flex items-center gap-2 rounded-md border border-default px-2 py-1 text-highlighted"
			v-if="game.played"
		>
			<span class="text-3xl font-bold">{{ game.goals.home }}</span>
			<span class="flex w-min">
				<UIcon name="i-mdi-minus-thick" />
			</span>
			<span class="text-3xl font-bold">{{ game.goals.away }}</span>
		</div>
		<div
			class="flex flex-col items-center rounded-md border border-default px-2 py-1 text-highlighted"
			v-if="!game.played"
		>
			<span class="text-2xl font-bold">{{ game.kickoff.time }}</span>
			<span class="text-xs">{{ game.kickoff.day }}</span>
		</div>
		<div class="flex flex-col justify-center">
			<TeamCrest
				:name="game.away.name"
				:crest-url="game.away.crest_url"
				class="w-[60px] h-[60px]"
			/>
		</div>
	</section>
</template>

<script setup lang="ts">
	import type { PublicFixture } from "~/types/Match";
	defineProps<{ game: PublicFixture }>();
</script>

<style scoped></style>
