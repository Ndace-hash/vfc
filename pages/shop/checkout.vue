<template>
	<section class="mx-auto max-w-5xl px-4 pt-6 md:pt-10">
		<UButton
			to="/shop/cart"
			variant="ghost"
			color="neutral"
			icon="i-bi-chevron-left"
			class="-ms-2.5"
			>Cart</UButton
		>
		<h1 class="mt-2 text-3xl font-bold text-highlighted">Checkout</h1>

		<div
			v-if="!cart.lines.value.length"
			class="mt-8 flex flex-col items-center gap-3 rounded-2xl px-6 py-14 text-center ring-1 ring-default"
		>
			<p class="text-lg font-semibold text-highlighted">Your cart is empty</p>
			<UButton to="/shop">Browse the shop</UButton>
		</div>

		<UForm
			v-else
			:state="state"
			:schema="checkoutFormSchema"
			class="mt-6 grid gap-10 lg:grid-cols-[1fr_22rem]"
			@submit="pay"
		>
			<div class="flex flex-col gap-8">
				<fieldset class="flex flex-col gap-4">
					<legend class="mb-1 text-lg font-semibold text-highlighted">Your details</legend>
					<UFormField label="Full name" name="customer_name" required>
						<UInput v-model="state.customer_name" autocomplete="name" size="lg" />
					</UFormField>
					<div class="grid gap-4 sm:grid-cols-2">
						<UFormField
							label="Email"
							name="customer_email"
							required
							description="For your Paystack receipt."
						>
							<UInput v-model="state.customer_email" type="email" autocomplete="email" size="lg" />
						</UFormField>
						<UFormField
							label="Phone"
							name="customer_phone"
							required
							description="So the club can reach you about your order."
						>
							<UInput v-model="state.customer_phone" type="tel" autocomplete="tel" size="lg" />
						</UFormField>
					</div>
				</fieldset>

				<fieldset>
					<legend class="mb-3 text-lg font-semibold text-highlighted">Pickup or delivery</legend>
					<div class="grid gap-3 sm:grid-cols-2">
						<label
							v-for="option in fulfilmentOptions"
							:key="option.value"
							class="flex cursor-pointer gap-3 rounded-xl p-4 ring-1 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primary"
							:class="
								state.fulfilment === option.value
									? 'bg-primary/5 ring-2 ring-primary'
									: 'ring-accented hover:bg-elevated'
							"
						>
							<input
								v-model="state.fulfilment"
								type="radio"
								name="fulfilment"
								:value="option.value"
								class="mt-1 size-4 accent-[var(--ui-primary)]"
							/>
							<span class="flex flex-col gap-1">
								<span class="flex flex-wrap items-baseline gap-x-2 font-semibold text-highlighted">
									{{ option.label }}
									<span class="font-normal text-toned">{{ option.price }}</span>
								</span>
								<span class="whitespace-pre-line text-sm text-muted">{{ option.detail }}</span>
							</span>
						</label>
					</div>
					<div v-if="state.fulfilment === 'delivery'" class="mt-4 flex flex-col gap-2">
						<UFormField label="Delivery address in Lagos" name="delivery_address" required>
							<UTextarea
								v-model="state.delivery_address"
								:rows="3"
								autocomplete="street-address"
								class="w-full"
							/>
						</UFormField>
					</div>
					<p v-if="settings?.outside_lagos_message" class="mt-3 text-sm text-muted">
						{{ settings.outside_lagos_message }}
					</p>
				</fieldset>

				<!-- left empty by people, who never see it; filled in by bots -->
				<div class="pointer-events-none absolute size-0 overflow-hidden opacity-0" aria-hidden="true">
					<label>
						Website
						<input v-model="website" type="text" tabindex="-1" autocomplete="off" />
					</label>
				</div>
			</div>

			<!-- summary -->
			<aside
				aria-labelledby="summary-heading"
				class="flex h-fit flex-col gap-4 rounded-2xl bg-muted p-5 ring-1 ring-default lg:sticky lg:top-24"
			>
				<h2 id="summary-heading" class="font-semibold text-highlighted">Order summary</h2>
				<USkeleton v-if="productsStatus === 'pending'" class="h-24" />
				<ul v-else class="flex flex-col gap-3">
					<li v-for="line in lines" :key="line.variantId" class="flex gap-3">
						<div class="relative size-14 shrink-0 overflow-hidden rounded-lg bg-default">
							<img
								v-if="line.product.image_urls[0]"
								:src="line.product.image_urls[0]"
								alt=""
								class="size-full object-cover"
							/>
							<span
								class="absolute -right-0 -top-0 grid size-5 place-items-center rounded-bl-lg bg-neutral-700 text-xs font-semibold text-white"
								:aria-label="`Quantity ${line.quantity}`"
								>{{ line.quantity }}</span
							>
						</div>
						<div class="min-w-0 flex-1 text-sm">
							<p class="truncate font-medium text-highlighted">{{ line.product.name }}</p>
							<p v-if="line.product.variants.length > 1" class="text-muted">{{ line.variant.label }}</p>
						</div>
						<p class="text-sm tabular-nums">{{ formatNaira(line.product.price_kobo * line.quantity) }}</p>
					</li>
				</ul>
				<dl class="grid grid-cols-[1fr_auto] gap-y-1.5 border-t border-default pt-4 text-sm">
					<dt class="text-toned">Subtotal</dt>
					<dd class="text-right tabular-nums">{{ formatNaira(subtotal) }}</dd>
					<dt class="text-toned">{{ state.fulfilment === "delivery" ? "Delivery" : "Pickup" }}</dt>
					<dd class="text-right tabular-nums">{{ deliveryFee ? formatNaira(deliveryFee) : "Free" }}</dd>
					<dt class="pt-2 text-base font-semibold text-highlighted">Total</dt>
					<dd class="pt-2 text-right text-base font-semibold tabular-nums text-highlighted">
						{{ formatNaira(subtotal + deliveryFee) }}
					</dd>
				</dl>

				<UAlert
					v-if="error"
					color="error"
					variant="subtle"
					icon="i-heroicons-exclamation-triangle"
					:description="error"
					:actions="cartChanged ? [{ label: 'Review cart', to: '/shop/cart', color: 'error', variant: 'outline' }] : undefined"
				/>

				<UButton
					type="submit"
					size="xl"
					block
					:loading="paying"
					:disabled="productsStatus !== 'success' || !lines.length"
					>Pay {{ formatNaira(subtotal + deliveryFee) }}</UButton
				>
				<p class="flex items-start gap-2 text-xs text-muted">
					<UIcon name="i-bi-shield" class="mt-0.5 size-3.5 shrink-0" />
					You’ll pay securely with Paystack by card, bank transfer or USSD, then come back here.
				</p>
				<NuxtLink to="/shop/policies" class="text-xs text-primary hover:underline"
					>Delivery, returns and privacy</NuxtLink
				>
			</aside>
		</UForm>
	</section>
</template>

<script setup lang="ts">
	import type { ShopSettings } from "~/types/Shop";

	useSeoMeta({ title: `Checkout | ${CLUB_NAME}` });

	const cart = useCart();
	const lastOrder = useLastOrder();
	const { status: productsStatus, findVariant } = useShopProducts();
	const { data: settings } = useFetch<Pick<ShopSettings, "pickup_address" | "delivery_fee_kobo" | "outside_lagos_message">>(
		"/api/shop/settings",
	);

	// the items being bought; anything unavailable stays in the cart to sort out there
	const lines = computed(() =>
		cart.lines.value.flatMap((line) => {
			const found = findVariant(line.variantId);
			return found ? [{ ...line, ...found }] : [];
		}),
	);
	const subtotal = computed(() =>
		lines.value.reduce((sum, line) => sum + line.product.price_kobo * line.quantity, 0),
	);

	const state = reactive({
		customer_name: "",
		customer_email: "",
		customer_phone: "",
		fulfilment: "pickup" as Fulfilment,
		delivery_address: "",
	});
	const website = ref("");

	const deliveryFee = computed(() =>
		state.fulfilment === "delivery" ? (settings.value?.delivery_fee_kobo ?? 0) : 0,
	);

	const fulfilmentOptions = computed(() => [
		{
			value: "pickup",
			label: "Pickup",
			price: "Free",
			detail: settings.value?.pickup_address ?? "Collect from the club.",
		},
		{
			value: "delivery",
			label: "Delivery in Lagos",
			price: settings.value?.delivery_fee_kobo
				? formatNaira(settings.value.delivery_fee_kobo)
				: "Free",
			detail: "Delivered to your address within Lagos.",
		},
	]);

	const paying = ref(false);
	const error = ref("");
	const cartChanged = ref(false);

	const pay = async () => {
		paying.value = true;
		error.value = "";
		cartChanged.value = false;
		try {
			const { reference, payment_url } = await $fetch<{ reference: string; payment_url: string }>(
				"/api/shop/checkout",
				{
					method: "POST",
					body: {
						...state,
						website: website.value,
						items: lines.value.map((line) => ({
							variant_id: line.variantId,
							quantity: line.quantity,
						})),
					},
				},
			);
			// the order page reads this when Paystack sends the customer back
			lastOrder.value = { reference, email: state.customer_email.trim() };
			window.location.href = payment_url;
		} catch (failure) {
			const statusCode = (failure as { statusCode?: number }).statusCode;
			cartChanged.value = statusCode === 409;
			error.value =
				statusCode === 429
					? "Too many attempts in a short time. Please wait a few minutes and try again."
					: fetchErrorMessage(failure);
			paying.value = false;
		}
	};
</script>
