<template>
	<!-- left out entirely until something is featured -->
	<section
		v-if="products.length"
		aria-labelledby="shop-heading"
		class="mx-auto max-w-6xl px-4 pt-16"
	>
		<div class="mb-5 flex items-center justify-between gap-4">
			<h2 id="shop-heading" class="text-2xl font-bold text-highlighted md:text-3xl">
				Shop
			</h2>
			<UButton to="/shop" variant="ghost" trailing-icon="i-bi-arrow-right" class="-me-2.5"
				>Visit the shop</UButton
			>
		</div>
		<ul class="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
			<li v-for="product in products.slice(0, 4)" :key="product.id">
				<ShopProductCard :product="product" />
			</li>
		</ul>
	</section>
</template>

<script setup lang="ts">
	import type { PublicProduct } from "~/types/Shop";

	const { data: products } = useFetch<PublicProduct[]>("/api/shop/products", {
		query: { featured: 1 },
		default: () => [],
	});
</script>
