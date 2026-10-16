<template>
	<NuxtLink
		:to="`/shop/${product.slug}`"
		class="group flex flex-col gap-3 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
	>
		<div class="relative aspect-square overflow-hidden rounded-2xl bg-elevated">
			<img
				v-if="product.image_urls[0]"
				:src="product.image_urls[0]"
				:alt="product.name"
				loading="lazy"
				class="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none"
			/>
			<UIcon v-else name="i-bi-bag" class="absolute inset-0 m-auto size-10 text-dimmed" />
			<UBadge
				v-if="soldOut"
				color="neutral"
				variant="solid"
				class="absolute left-3 top-3"
				>Sold out</UBadge
			>
		</div>
		<div>
			<h3 class="font-semibold text-highlighted group-hover:text-primary">
				{{ product.name }}
			</h3>
			<p class="mt-0.5 text-toned tabular-nums">{{ formatNaira(product.price_kobo) }}</p>
		</div>
	</NuxtLink>
</template>

<script setup lang="ts">
	import type { PublicProduct } from "~/types/Shop";

	const props = defineProps<{ product: PublicProduct }>();

	const soldOut = computed(() =>
		props.product.variants.every((variant) => variant.stock === 0),
	);
</script>
