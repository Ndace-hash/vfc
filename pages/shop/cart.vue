<template>
	<section class="mx-auto max-w-3xl px-4 pt-8 md:pt-12">
		<h1 class="text-3xl font-bold text-highlighted">Your cart</h1>

		<div v-if="status === 'pending' && cart.lines.value.length" class="mt-6 flex flex-col gap-4">
			<USkeleton v-for="n in cart.lines.value.length" :key="n" class="h-28 rounded-2xl" />
		</div>

		<div
			v-else-if="!cart.lines.value.length"
			class="mt-8 flex flex-col items-center gap-3 rounded-2xl px-6 py-14 text-center ring-1 ring-default"
		>
			<UIcon name="i-bi-bag" class="size-10 text-dimmed" />
			<p class="text-lg font-semibold text-highlighted">Your cart is empty</p>
			<UButton to="/shop" class="mt-2">Browse the shop</UButton>
		</div>

		<template v-else>
			<ul class="mt-6 divide-y divide-default border-y border-default">
				<li v-for="line in lines" :key="line.variantId" class="flex gap-4 py-5">
					<NuxtLink
						v-if="line.product"
						:to="`/shop/${line.product.slug}`"
						class="size-24 shrink-0 overflow-hidden rounded-xl bg-elevated"
					>
						<img
							v-if="line.product.image_urls[0]"
							:src="line.product.image_urls[0]"
							alt=""
							class="size-full object-cover"
						/>
					</NuxtLink>
					<div v-else class="size-24 shrink-0 rounded-xl bg-elevated" />

					<div class="flex min-w-0 flex-1 flex-col gap-2">
						<div class="flex justify-between gap-4">
							<div class="min-w-0">
								<p class="font-semibold text-highlighted">
									{{ line.product?.name ?? "No longer available" }}
								</p>
								<p v-if="line.variant && line.product!.variants.length > 1" class="text-sm text-muted">
									{{ line.product!.option_name }}: {{ line.variant.label }}
								</p>
							</div>
							<p v-if="line.product" class="shrink-0 font-semibold tabular-nums text-highlighted">
								{{ formatNaira(line.product.price_kobo * line.quantity) }}
							</p>
						</div>

						<p v-if="line.problem" class="text-sm font-medium text-error">
							{{ line.problem }}
						</p>

						<div class="mt-auto flex items-center justify-between gap-2">
							<ShopQuantityStepper
								v-if="line.variant && line.variant.stock > 0"
								:model-value="line.quantity"
								:label="`Quantity of ${line.product!.name}`"
								:max="Math.min(line.variant.stock, MAX_QUANTITY)"
								@update:model-value="(value) => cart.setQuantity(line.variantId, value)"
							/>
							<span v-else />
							<UButton
								color="neutral"
								variant="ghost"
								icon="i-bi-trash3"
								:aria-label="`Remove ${line.product?.name ?? 'item'}`"
								@click="cart.remove(line.variantId)"
							/>
						</div>
					</div>
				</li>
			</ul>

			<div class="mt-6 flex flex-col gap-4 sm:items-end">
				<dl class="flex w-full justify-between gap-6 text-lg sm:w-auto">
					<dt class="text-toned">Subtotal</dt>
					<dd class="font-semibold tabular-nums text-highlighted">{{ formatNaira(subtotal) }}</dd>
				</dl>
				<p class="text-sm text-muted">Delivery, if you choose it, is added at checkout.</p>
				<UAlert
					v-if="hasProblems"
					color="error"
					variant="subtle"
					icon="i-heroicons-exclamation-triangle"
					description="Some items have changed. Update or remove them to continue."
					class="w-full"
				/>
				<UButton
					to="/shop/checkout"
					size="xl"
					class="w-full justify-center sm:w-auto sm:px-10"
					:disabled="hasProblems || !lines.length"
					>Checkout</UButton
				>
				<UButton to="/shop" variant="ghost" color="neutral" class="self-center sm:self-end"
					>Continue shopping</UButton
				>
			</div>
		</template>
	</section>
</template>

<script setup lang="ts">
	useSeoMeta({ title: `Cart | ${CLUB_NAME}` });

	const cart = useCart();
	const { status, findVariant } = useShopProducts();

	// each cart line with its product, and anything stopping checkout
	const lines = computed(() =>
		cart.lines.value.map((line) => {
			const found = status.value === "success" ? findVariant(line.variantId) : null;
			let problem = "";
			if (status.value === "success") {
				if (!found) problem = "This item is no longer for sale. Please remove it.";
				else if (found.variant.stock === 0) problem = "Sold out. Please remove it.";
				else if (found.variant.stock < line.quantity)
					problem = `Only ${found.variant.stock} left. Lower the quantity to continue.`;
			}
			return { ...line, product: found?.product, variant: found?.variant, problem };
		}),
	);

	const hasProblems = computed(() => lines.value.some((line) => line.problem));
	const subtotal = computed(() =>
		lines.value.reduce(
			(sum, line) => sum + (line.product && !line.problem ? line.product.price_kobo * line.quantity : 0),
			0,
		),
	);
</script>
