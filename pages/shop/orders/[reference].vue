<template>
	<section class="mx-auto max-w-2xl px-4 pt-8 md:pt-12">
		<!-- arrived without the email: ask for it -->
		<div v-if="!email" class="flex flex-col gap-4">
			<h1 class="text-3xl font-bold text-highlighted">Order {{ reference }}</h1>
			<p class="text-toned">Enter the email you used at checkout to see this order.</p>
			<form class="flex flex-col gap-3 sm:flex-row" @submit.prevent="useEmail">
				<UInput
					v-model="emailInput"
					type="email"
					required
					autocomplete="email"
					placeholder="you@example.com"
					size="lg"
					class="flex-1"
					aria-label="Email"
				/>
				<UButton type="submit" size="lg">View order</UButton>
			</form>
		</div>

		<div v-else-if="!order && loading" class="flex flex-col gap-4">
			<USkeleton class="h-10 w-2/3" />
			<USkeleton class="h-40" />
		</div>

		<div v-else-if="!order" class="flex flex-col items-start gap-4">
			<h1 class="text-3xl font-bold text-highlighted">Order not found</h1>
			<p class="text-toned">{{ loadError }}</p>
			<div class="flex gap-2">
				<UButton to="/shop/track">Try again</UButton>
				<UButton to="/shop" color="neutral" variant="ghost">Back to the shop</UButton>
			</div>
		</div>

		<div v-else class="flex flex-col gap-8">
			<!-- what happened, in a sentence -->
			<div class="flex flex-col items-start gap-3">
				<UIcon :name="headline.icon" class="size-12" :class="headline.iconClass" />
				<h1 class="text-3xl font-bold text-highlighted">{{ headline.title }}</h1>
				<p class="text-lg text-toned">{{ headline.body }}</p>
				<p class="text-sm text-muted">
					Order <span class="font-mono font-semibold text-highlighted">{{ order.reference }}</span>
					· {{ formatDate(order.created_at) }}
				</p>
				<div v-if="order.status === 'pending_payment' && !checking" class="flex flex-wrap gap-2">
					<UButton icon="i-heroicons-arrow-path-20-solid" @click="load">Check again</UButton>
					<UButton to="/shop/cart" color="neutral" variant="ghost">Back to your cart</UButton>
				</div>
			</div>

			<section
				v-if="order.status !== 'cancelled'"
				aria-labelledby="where-heading"
				class="rounded-2xl bg-muted p-5 ring-1 ring-default"
			>
				<h2 id="where-heading" class="flex items-center gap-2 font-semibold text-highlighted">
					<UIcon :name="order.fulfilment === 'pickup' ? 'i-bi-geo-alt-fill' : 'i-bi-truck'" class="size-4" />
					{{ order.fulfilment === "pickup" ? "Pickup" : "Delivery" }}
				</h2>
				<p class="mt-1 whitespace-pre-line text-toned">
					{{ order.fulfilment === "pickup" ? order.pickup_address : order.delivery_address }}
				</p>
				<p class="mt-2 text-sm text-muted">
					{{
						order.fulfilment === "pickup"
							? "The club will call you when it’s ready to collect. Bring your order number."
							: "The club will call you to arrange delivery."
					}}
				</p>
			</section>

			<section aria-labelledby="items-heading">
				<h2 id="items-heading" class="font-semibold text-highlighted">Items</h2>
				<ul class="mt-2 divide-y divide-default border-y border-default">
					<li v-for="(item, index) in order.items" :key="index" class="flex justify-between gap-4 py-3">
						<span>
							<span class="text-highlighted">{{ item.product_name }}</span>
							<span class="text-muted"> · {{ item.variant_label }} × {{ item.quantity }}</span>
						</span>
						<span class="tabular-nums">{{ formatNaira(item.unit_price_kobo * item.quantity) }}</span>
					</li>
				</ul>
				<dl class="mt-3 grid grid-cols-[1fr_auto] gap-y-1 text-sm">
					<dt class="text-toned">Subtotal</dt>
					<dd class="text-right tabular-nums">{{ formatNaira(order.subtotal_kobo) }}</dd>
					<dt class="text-toned">{{ order.fulfilment === "pickup" ? "Pickup" : "Delivery" }}</dt>
					<dd class="text-right tabular-nums">
						{{ order.delivery_fee_kobo ? formatNaira(order.delivery_fee_kobo) : "Free" }}
					</dd>
					<dt class="pt-1 text-base font-semibold text-highlighted">Total</dt>
					<dd class="pt-1 text-right text-base font-semibold tabular-nums text-highlighted">
						{{ formatNaira(order.total_kobo) }}
					</dd>
				</dl>
			</section>

			<p class="text-sm text-muted">
				Questions about your order? Email
				<a :href="`mailto:${CONTACT_EMAIL}?subject=Order ${order.reference}`" class="text-primary hover:underline">{{
					CONTACT_EMAIL
				}}</a>
				with your order number.
			</p>
			<UButton to="/shop" color="neutral" variant="outline" class="self-start">Continue shopping</UButton>
		</div>
	</section>
</template>

<script setup lang="ts">
	import type { PublicOrder } from "~/types/Shop";

	useSeoMeta({ title: `Your order | ${CLUB_NAME}`, robots: "noindex" });

	const route = useRoute();
	const cart = useCart();
	const lastOrder = useLastOrder();

	const reference = computed(() => String(route.params.reference).toUpperCase());

	// the email comes from checkout or the track page, never from the address bar
	const email = ref(
		lastOrder.value?.reference === reference.value ? lastOrder.value.email : "",
	);
	const emailInput = ref("");
	const useEmail = () => {
		email.value = emailInput.value.trim();
		lastOrder.value = { reference: reference.value, email: email.value };
		load();
	};

	const order = ref<PublicOrder | null>(null);
	const loading = ref(false);
	const loadError = ref("");
	// still waiting for Paystack to confirm, and checking again shortly
	const checking = ref(false);

	let tries = 0;
	let timer: ReturnType<typeof setTimeout> | undefined;

	const load = async () => {
		if (!email.value) return;
		clearTimeout(timer);
		loading.value = true;
		try {
			order.value = await $fetch<PublicOrder>(`/api/shop/orders/${reference.value}`, {
				query: { email: email.value },
			});
			loadError.value = "";
		} catch (error) {
			loadError.value = fetchErrorMessage(error);
		} finally {
			loading.value = false;
		}

		// payment can take a few seconds to confirm; look again for about half a minute
		if (order.value?.status === "pending_payment" && tries < 10) {
			tries++;
			checking.value = true;
			timer = setTimeout(load, 3000);
		} else {
			checking.value = false;
			tries = 0;
		}

		// paid for: what was in the cart has been bought
		if (
			order.value &&
			!["pending_payment", "cancelled"].includes(order.value.status) &&
			lastOrder.value?.reference === order.value.reference &&
			cart.lines.value.length
		) {
			cart.clear();
		}
	};
	onMounted(load);
	onBeforeUnmount(() => clearTimeout(timer));

	const firstName = computed(() => order.value?.customer_name.trim().split(/\s+/)[0] ?? "");

	const headline = computed(() => {
		const status = order.value?.status;
		const pickup = order.value?.fulfilment === "pickup";
		switch (status) {
			case "pending_payment":
				return checking.value
					? {
							icon: "i-heroicons-arrow-path-20-solid",
							iconClass: "text-primary animate-spin motion-reduce:animate-none",
							title: "Confirming your payment…",
							body: "This usually takes a few seconds. Please keep this page open.",
						}
					: {
							icon: "i-bi-hourglass-split",
							iconClass: "text-muted",
							title: "Payment not received yet",
							body: "If you paid, it can take a minute to come through; check again shortly. If you left before paying, your cart is still saved.",
						};
			case "needs_attention":
				return {
					icon: "i-bi-check-circle-fill",
					iconClass: "text-primary",
					title: `Thanks, ${firstName.value}. We’ve received your payment`,
					body: "Something in your order needs checking (for example, an item sold out at the same moment). The club will contact you shortly to sort it out or refund you.",
				};
			case "ready":
				return {
					icon: pickup ? "i-bi-bag-check-fill" : "i-bi-truck",
					iconClass: "text-primary",
					title: pickup ? "Your order is ready to collect" : "Your order is on its way",
					body: pickup ? "Bring your order number when you collect it." : "The club will call you when it’s close.",
				};
			case "completed":
				return {
					icon: "i-bi-check-circle-fill",
					iconClass: "text-primary",
					title: pickup ? "Collected" : "Delivered",
					body: "Thanks for supporting the club.",
				};
			case "cancelled":
				return {
					icon: "i-bi-x-lg",
					iconClass: "text-muted",
					title: "This order was cancelled",
					body: "If you were charged, the club will refund you. Contact us if you have questions.",
				};
			default:
				return {
					icon: "i-bi-check-circle-fill",
					iconClass: "text-primary",
					title: `Thanks, ${firstName.value}! Your order is confirmed`,
					body: pickup
						? "We’ll let you know when it’s ready to collect. Paystack has emailed your receipt."
						: "We’ll be in touch to arrange delivery. Paystack has emailed your receipt.",
				};
		}
	});

	const formatDate = (date: string) =>
		new Date(date).toLocaleString("en-GB", {
			timeZone: CLUB_TIME_ZONE,
			day: "numeric",
			month: "long",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
</script>
