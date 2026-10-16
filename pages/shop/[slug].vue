<template>
	<section class="mx-auto max-w-6xl px-4 pt-6 md:pt-10">
		<UButton
			to="/shop"
			variant="ghost"
			color="neutral"
			icon="i-bi-chevron-left"
			class="-ms-2.5"
			>Shop</UButton
		>

		<div v-if="status === 'pending'" class="mt-4 grid gap-8 md:grid-cols-2">
			<USkeleton class="aspect-square rounded-2xl" />
			<div class="flex flex-col gap-4">
				<USkeleton class="h-8 w-2/3" />
				<USkeleton class="h-6 w-1/4" />
				<USkeleton class="h-24" />
			</div>
		</div>

		<div v-else-if="!product" class="mt-10 flex flex-col items-start gap-3">
			<h1 class="text-2xl font-bold text-highlighted">This product isn’t available</h1>
			<p class="text-toned">It may have sold out or been taken out of the shop.</p>
			<UButton to="/shop">Back to the shop</UButton>
		</div>

		<div v-else class="mt-4 grid gap-8 md:grid-cols-2 md:gap-12">
			<!-- photos -->
			<div class="flex flex-col gap-3">
				<div class="aspect-square overflow-hidden rounded-2xl bg-elevated">
					<img
						v-if="product.image_urls[photo]"
						:src="product.image_urls[photo]"
						:alt="`${product.name}, photo ${photo + 1} of ${product.image_urls.length}`"
						class="size-full object-cover"
					/>
				</div>
				<ul v-if="product.image_urls.length > 1" class="flex gap-3" aria-label="Photos">
					<li v-for="(url, index) in product.image_urls" :key="url">
						<button
							type="button"
							class="size-20 overflow-hidden rounded-lg bg-elevated ring-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
							:class="index === photo ? 'ring-primary' : 'ring-transparent'"
							:aria-label="`Show photo ${index + 1}`"
							:aria-pressed="index === photo"
							@click="photo = index"
						>
							<img :src="url" alt="" class="size-full object-cover" />
						</button>
					</li>
				</ul>
			</div>

			<!-- details -->
			<div class="flex flex-col gap-6">
				<div>
					<h1 class="text-3xl font-bold text-highlighted">{{ product.name }}</h1>
					<p class="mt-2 text-2xl text-highlighted tabular-nums">
						{{ formatNaira(product.price_kobo) }}
					</p>
				</div>

				<fieldset v-if="!onlyOneSize">
					<legend class="text-sm font-semibold text-highlighted">
						{{ product.option_name }}
					</legend>
					<div class="mt-2 flex flex-wrap gap-2">
						<label
							v-for="variant in product.variants"
							:key="variant.id"
							class="relative flex min-h-11 min-w-14 cursor-pointer items-center justify-center rounded-lg px-4 font-medium ring-1 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primary has-[:disabled]:cursor-not-allowed has-[:disabled]:text-dimmed has-[:disabled]:line-through"
							:class="
								chosenId === variant.id
									? 'bg-primary text-white ring-primary'
									: 'ring-accented hover:bg-elevated'
							"
						>
							<input
								v-model="chosenId"
								type="radio"
								name="variant"
								class="sr-only"
								:value="variant.id"
								:disabled="variant.stock === 0"
							/>
							{{ variant.label }}
							<span v-if="variant.stock === 0" class="sr-only">(sold out)</span>
						</label>
					</div>
					<p v-if="chosen && chosen.stock <= LOW_STOCK" class="mt-2 text-sm font-medium text-amber-700">
						Only {{ chosen.stock }} left
					</p>
				</fieldset>

				<div v-if="!soldOut" class="flex flex-wrap items-center gap-3">
					<ShopQuantityStepper
						v-model="quantity"
						:label="`Quantity of ${product.name}`"
						:max="maxQuantity"
					/>
					<UButton
						size="xl"
						class="flex-1 justify-center px-8 sm:flex-none"
						:disabled="!chosen"
						@click="addToCart"
						>{{ chosen ? "Add to cart" : `Choose a ${product.option_name.toLowerCase()}` }}</UButton
					>
				</div>
				<UAlert
					v-else
					color="neutral"
					variant="subtle"
					icon="i-bi-bag"
					title="Sold out"
					description="Check back soon, or follow the club for restock news."
				/>

				<p v-if="product.description" class="whitespace-pre-line text-toned">
					{{ product.description }}
				</p>

				<p class="flex items-start gap-2 border-t border-default pt-5 text-sm text-toned">
					<UIcon name="i-bi-truck" class="mt-0.5 size-4 shrink-0" />
					Collect free from the club, or have it delivered within Lagos.
					<NuxtLink to="/shop/policies" class="text-primary hover:underline">Delivery and returns</NuxtLink>
				</p>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
	import type { PublicProduct } from "~/types/Shop";

	const route = useRoute();
	const toast = useToast();
	const cart = useCart();

	const { data: product, status } = useFetch<PublicProduct | null>(
		() => `/api/shop/products/${route.params.slug}`,
		{ default: () => null },
	);

	useSeoMeta({
		title: () => (product.value ? `${product.value.name} | ${CLUB_NAME}` : `Shop | ${CLUB_NAME}`),
		description: () => product.value?.description || `Official ${CLUB_NAME} merchandise.`,
	});

	const photo = ref(0);
	const chosenId = ref<number | null>(null);
	const quantity = ref(1);

	const soldOut = computed(
		() => !product.value?.variants.some((variant) => variant.stock > 0),
	);
	// a single "One size" doesn't need a picker
	const onlyOneSize = computed(() => product.value?.variants.length === 1);

	// choose the only size, or the only one in stock, for the customer
	watch(
		product,
		(current) => {
			const inStock = current?.variants.filter((variant) => variant.stock > 0) ?? [];
			chosenId.value = inStock.length === 1 ? inStock[0]!.id : null;
			photo.value = 0;
		},
		{ immediate: true },
	);

	const chosen = computed(
		() => product.value?.variants.find((variant) => variant.id === chosenId.value) ?? null,
	);
	// what is in stock, less what is already in the cart
	const maxQuantity = computed(() =>
		chosen.value
			? Math.max(Math.min(chosen.value.stock, MAX_QUANTITY) - cart.quantityOf(chosen.value.id), 1)
			: MAX_QUANTITY,
	);
	watch(maxQuantity, (max) => {
		if (quantity.value > max) quantity.value = max;
	});

	const addToCart = () => {
		if (!product.value || !chosen.value) return;
		const already = cart.quantityOf(chosen.value.id);
		if (already >= Math.min(chosen.value.stock, MAX_QUANTITY)) {
			toast.add({
				title: "Already in your cart",
				description: `You have all ${already} that are available.`,
				color: "neutral",
			});
			return;
		}
		cart.add(chosen.value.id, quantity.value);
		toast.add({
			title: "Added to your cart",
			description: `${product.value.name}${onlyOneSize.value ? "" : ` (${chosen.value.label})`} × ${quantity.value}`,
			color: "success",
			actions: [{ label: "View cart", to: "/shop/cart", color: "primary", variant: "solid" }],
		});
		quantity.value = 1;
	};
</script>
