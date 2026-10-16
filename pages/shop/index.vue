<template>
	<section class="mx-auto max-w-6xl px-4 pt-8 md:pt-12">
		<div class="flex flex-wrap items-end justify-between gap-4">
			<div>
				<h1 class="text-3xl font-bold text-highlighted">Shop</h1>
				<p class="mt-2 text-toned">Official {{ CLUB_NAME }} kit and accessories.</p>
			</div>
			<UButton to="/shop/track" variant="ghost" color="neutral" icon="i-bi-search" class="-me-2.5"
				>Track an order</UButton
			>
		</div>

		<div
			v-if="status === 'pending'"
			class="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4"
		>
			<div v-for="n in 8" :key="n" class="flex flex-col gap-3">
				<USkeleton class="aspect-square rounded-2xl" />
				<USkeleton class="h-4 w-2/3" />
			</div>
		</div>

		<UAlert
			v-else-if="error"
			class="mt-8"
			color="error"
			variant="subtle"
			icon="i-heroicons-exclamation-triangle"
			title="The shop couldn’t load"
			description="Please refresh the page to try again."
		/>

		<p v-else-if="!products.length" class="mt-8 text-toned">
			Nothing for sale right now. Check back soon.
		</p>

		<ul
			v-else
			class="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4"
		>
			<li v-for="product in products" :key="product.id">
				<ShopProductCard :product="product" />
			</li>
		</ul>
	</section>
</template>

<script setup lang="ts">
	useSeoMeta({
		title: `Shop | ${CLUB_NAME}`,
		description: `Official ${CLUB_NAME} kit and accessories, with pickup or delivery in Lagos.`,
	});

	const { data: products, status, error } = useShopProducts();
</script>
