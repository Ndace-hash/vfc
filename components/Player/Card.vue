<template>
	<article
		class="w-[250px] h-[350px] relative rounded-[8px] shadow-xl overflow-hidden mx-2 my-4 shrink-0"
	>
		<div class="v-logo-bg absolute inset-0 -z-10"></div>
		<span
			class="absolute -z-10 -right-2 -top-2 text-7xl opacity-50 text-primary"
			>{{ playerData.jersey_number }}
		</span>
		<div class="flex w-full h-full flex-col">
			<div class="h-3/4 flex items-center justify-center">
				<img
					v-if="hasPhoto"
					:src="playerData.photo_url!"
					:alt="`Photo of ${playerData.full_name}`"
					class="w-full h-full"
					@error="photoFailed = true"
				/>
				<!-- placeholder for players without a photo -->
				<div
					v-else
					class="w-40 h-40 rounded-full bg-gray-200 flex items-end justify-center overflow-hidden"
					role="img"
					:aria-label="`No photo of ${playerData.full_name}`"
				>
					<UIcon
						name="i-heroicons-user-solid"
						class="text-[9rem] -mb-5 text-gray-400"
					/>
				</div>
			</div>
			<div
				class="bg-white text-primary font-bold w-full px-2 py-4 justify-self-end"
			>
				<p class="text-lg">{{ firstNames }}</p>
				<p class="text-3xl">{{ lastName }}</p>
			</div>
		</div>
	</article>
</template>

<script setup lang="ts">
	import type { PublicPlayer } from "~/types/Player";
	const props = defineProps<{ playerData: PublicPlayer }>();

	const photoFailed = ref(false);
	const hasPhoto = computed(
		() => !!props.playerData.photo_url && !photoFailed.value,
	);

	const firstNames = computed(
		() => splitPlayerName(props.playerData.full_name)[0],
	);
	const lastName = computed(
		() => splitPlayerName(props.playerData.full_name)[1],
	);
</script>

<style scoped lang="scss">
	.v-logo-bg {
		background-image: URL("/valiant.png");
		background-size: cover;
		background-position: center;
		transform: translateX(-20%) translateY(-20%) scale(0.6);
		opacity: 0.4;
	}
</style>
