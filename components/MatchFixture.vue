<template>
	<article class="my-4 border border-[#022B2D] py-4 rounded-[8px] px-4">
		<div class="flex flex-col items-center gap-1">
			<p class="text-xs md:text-sm uppercase">{{ NextOrPrev }} Fixture</p>
			<p class="text-primary font-bold text-sm md:text-base">
				{{ game.kickoff.day }}
			</p>
			<span
				class="font-bold opacity-65 text-primary text-lg"
				v-if="!game.played"
				>{{ game.kickoff.time }}</span
			>
		</div>
		<div class="flex items-center my-4">
			<div
				class="w-[100px] md:w-[200px] flex flex-col items-center justify-center gap-1 md:gap-0"
			>
				<TeamCrest
					:name="game.home.name"
					:crest-url="game.home.crest_url"
					class="w-full aspect-square"
				/>
				<p class="text-xs md:text-sm">{{ game.home.name }}</p>
			</div>
			<span v-show="game.played" class="font-bold text-2xl">{{
				game.goals.home
			}}</span>
			<p class="uppercase text-lg font-semibold mx-8">vs</p>
			<span v-show="game.played" class="font-bold text-2xl">{{
				game.goals.away
			}}</span>
			<div
				class="w-[100px] md:w-[200px] flex flex-col items-center justify-center gap-1 md:gap-0"
			>
				<TeamCrest
					:name="game.away.name"
					:crest-url="game.away.crest_url"
					class="w-full aspect-square"
				/>
				<p class="text-xs md:text-sm">{{ game.away.name }}</p>
			</div>
		</div>
	</article>
</template>

<script setup lang="ts">
	import type { PublicFixture } from "~/types/Match";
	const props = defineProps<{
		NextOrPrev: string;
		game: PublicFixture;
	}>();
</script>

<style lang="scss" scoped>
	article {
		box-shadow: 0 6px 7px 0 rgba($color: #000000, $alpha: 0.25);
	}
</style>
