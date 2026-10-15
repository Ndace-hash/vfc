<template>
	<img
		v-if="hasCrest"
		:src="crestUrl!"
		:alt="`${name} crest`"
		class="object-contain"
		@error="crestFailed = true"
	/>
	<!-- placeholder shield for teams without a crest -->
	<svg
		v-else
		viewBox="0 0 24 24"
		role="img"
		:aria-label="`No crest for ${name}`"
		class="text-gray-300"
	>
		<path
			fill="currentColor"
			d="M12 2 4 5v6c0 5.1 3.4 9.7 8 11 4.6-1.3 8-5.9 8-11V5l-8-3Z"
		/>
		<text
			x="12"
			y="14.5"
			text-anchor="middle"
			font-size="7"
			font-weight="700"
			fill="#6b7280"
		>
			{{ initials }}
		</text>
	</svg>
</template>

<script setup lang="ts">
	const props = defineProps<{
		name: string;
		// empty or missing until the team gets a crest
		crestUrl?: string | null;
	}>();

	const crestFailed = ref(false);
	const hasCrest = computed(() => !!props.crestUrl && !crestFailed.value);

	// "Valiant FC" -> "VF"
	const initials = computed(() =>
		props.name
			.trim()
			.split(/\s+/)
			.slice(0, 2)
			.map((word) => word[0]?.toUpperCase() ?? "")
			.join(""),
	);

	// a new crest gets a fresh chance to load
	watch(
		() => props.crestUrl,
		() => {
			crestFailed.value = false;
		},
	);
</script>
