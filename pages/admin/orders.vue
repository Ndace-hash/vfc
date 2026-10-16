<template>
	<Head>
		<Title>Orders | Valiant FC</Title>
	</Head>
	<section class="px-4">
		<h1 class="text-highlighted text-2xl max-w-[1100px] mx-auto my-6">Orders</h1>

		<div class="bg-default max-w-[1100px] mx-auto rounded-[8px] shadow-sm ring-1 ring-default my-10">
			<div
				class="flex flex-wrap items-center gap-2 p-4 justify-between border-b border-default"
			>
				<UTabs
					v-model="filter"
					:items="filterItems"
					:content="false"
					size="sm"
					class="w-auto max-w-full overflow-x-auto"
				/>
				<UButton
					color="neutral"
					variant="ghost"
					icon="i-heroicons-arrow-path-20-solid"
					:loading="loading"
					@click="loadOrders"
				>
					Refresh
				</UButton>
			</div>

			<UAlert
				v-if="loadError"
				color="error"
				variant="subtle"
				icon="i-heroicons-exclamation-triangle"
				title="Could not load orders"
				:description="loadError"
				class="m-4 w-auto"
			/>

			<UTable
				:data="shown"
				:columns="columns"
				:loading="loading"
				class="cursor-pointer"
				@select="(_, row) => open(row.original)"
			>
				<template #reference-cell="{ row }">
					<p class="font-mono font-medium text-highlighted">
						{{ row.original.reference }}
					</p>
					<p class="text-sm text-muted">{{ formatDate(row.original.created_at) }}</p>
				</template>
				<template #customer_name-cell="{ row }">
					<p class="text-highlighted">{{ row.original.customer_name }}</p>
					<p class="text-sm text-muted">
						{{ row.original.fulfilment === "pickup" ? "Pickup" : "Delivery" }}
					</p>
				</template>
				<template #items-cell="{ row }">
					<p class="max-w-xs truncate text-toned">{{ itemSummary(row.original) }}</p>
				</template>
				<template #total_kobo-cell="{ row }">
					<span class="tabular-nums">{{ formatNaira(row.original.total_kobo) }}</span>
				</template>
				<template #status-cell="{ row }">
					<UBadge :color="statusColor(row.original.status)" variant="subtle">{{
						orderStatusLabel(row.original.status)
					}}</UBadge>
				</template>

				<template #empty>
					<div class="flex flex-col items-center gap-2 py-10">
						<UIcon name="i-bi-receipt" class="text-3xl" />
						<span>{{ emptyMessage }}</span>
					</div>
				</template>
			</UTable>
		</div>

		<USlideover
			:open="!!selected"
			:title="selected ? `Order ${selected.reference}` : ''"
			:description="selected ? `Placed ${formatDate(selected.created_at, true)}` : ''"
			:ui="{ content: 'sm:max-w-lg' }"
			@update:open="
				(isOpen) => {
					if (!isOpen) selected = null;
				}
			"
		>
			<template #body>
				<div v-if="selected" class="flex flex-col gap-6">
					<div class="flex items-center gap-2">
						<UBadge :color="statusColor(selected.status)" variant="subtle" size="lg">{{
							orderStatusLabel(selected.status)
						}}</UBadge>
						<span v-if="selected.paid_at" class="text-sm text-muted"
							>Paid {{ formatDate(selected.paid_at, true) }}</span
						>
					</div>

					<UAlert
						v-if="selected.status === 'needs_attention'"
						color="warning"
						variant="subtle"
						icon="i-bi-exclamation-triangle-fill"
						title="This order needs attention"
						:description="`${selected.attention_reason ?? ''} Refund the customer in your Paystack dashboard, or restock and mark it resolved.`"
					/>
					<UAlert
						v-else-if="selected.status === 'pending_payment'"
						color="neutral"
						variant="subtle"
						icon="i-bi-hourglass-split"
						title="Not paid"
						description="The customer started checkout but Paystack hasn’t confirmed a payment. Usually they left before paying."
					/>

					<section aria-labelledby="order-items">
						<h3 id="order-items" class="text-sm font-semibold text-highlighted">Items</h3>
						<ul class="mt-2 divide-y divide-default">
							<li
								v-for="item in selected.items"
								:key="item.id"
								class="flex justify-between gap-4 py-2"
							>
								<span>
									<span class="text-highlighted">{{ item.product_name }}</span>
									<span class="text-muted"> · {{ item.variant_label }} × {{ item.quantity }}</span>
								</span>
								<span class="tabular-nums">{{
									formatNaira(item.unit_price_kobo * item.quantity)
								}}</span>
							</li>
						</ul>
						<dl class="mt-2 grid grid-cols-[1fr_auto] gap-y-1 border-t border-default pt-2 text-sm">
							<dt class="text-muted">Subtotal</dt>
							<dd class="text-right tabular-nums">{{ formatNaira(selected.subtotal_kobo) }}</dd>
							<dt class="text-muted">Delivery</dt>
							<dd class="text-right tabular-nums">
								{{ selected.delivery_fee_kobo ? formatNaira(selected.delivery_fee_kobo) : "Free" }}
							</dd>
							<dt class="font-semibold text-highlighted">Total</dt>
							<dd class="text-right font-semibold tabular-nums text-highlighted">
								{{ formatNaira(selected.total_kobo) }}
							</dd>
						</dl>
					</section>

					<section aria-labelledby="order-customer">
						<h3 id="order-customer" class="text-sm font-semibold text-highlighted">
							Customer
						</h3>
						<dl class="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
							<dt class="text-muted">Name</dt>
							<dd>{{ selected.customer_name }}</dd>
							<dt class="text-muted">Email</dt>
							<dd>
								<a :href="`mailto:${selected.customer_email}`" class="break-all text-primary hover:underline">{{
									selected.customer_email
								}}</a>
							</dd>
							<dt class="text-muted">Phone</dt>
							<dd>
								<a :href="`tel:${selected.customer_phone}`" class="text-primary hover:underline">{{
									selected.customer_phone
								}}</a>
							</dd>
							<dt class="text-muted">{{ selected.fulfilment === "pickup" ? "Collecting" : "Deliver to" }}</dt>
							<dd class="whitespace-pre-wrap">
								{{ selected.fulfilment === "pickup" ? "Pickup" : selected.delivery_address }}
							</dd>
						</dl>
					</section>

					<div class="flex flex-col gap-3 border-t border-default pt-5">
						<UButton
							v-if="nextStep(selected)"
							block
							size="lg"
							:loading="saving === nextStep(selected)!.status"
							:disabled="!!saving"
							@click="setStatus(nextStep(selected)!.status)"
							>{{ nextStep(selected)!.label }}</UButton
						>
						<UButton
							v-if="!['completed', 'cancelled'].includes(selected.status)"
							block
							color="error"
							variant="ghost"
							:disabled="!!saving"
							@click="confirmCancel = true"
							>Cancel order</UButton
						>
					</div>
				</div>
			</template>
		</USlideover>

		<UModal
			v-model:open="confirmCancel"
			:title="`Cancel order ${selected?.reference}?`"
			:description="
				selected?.status === 'pending_payment'
					? 'This order was never paid for.'
					: 'Cancelling doesn’t refund the customer or put the items back in stock. Refund them in your Paystack dashboard, and update stock in Products.'
			"
		>
			<template #body>
				<div class="flex justify-end gap-2">
					<UButton color="neutral" variant="ghost" @click="confirmCancel = false"
						>Keep order</UButton
					>
					<UButton
						color="error"
						:loading="saving === 'cancelled'"
						@click="setStatus('cancelled')"
						>Cancel order</UButton
					>
				</div>
			</template>
		</UModal>
	</section>
</template>

<script setup lang="ts">
	import type { TableColumn } from "@nuxt/ui";
	import type { Order } from "~/types/Shop";

	definePageMeta({
		layout: "admin",
	});

	const adminFetch = useAdminFetch();
	const toast = useToast();
	const { refresh: refreshBadge } = useAdminBadge("orders");

	const orders = ref<Order[]>([]);
	const loading = ref(false);
	const loadError = ref("");

	const loadOrders = async () => {
		loading.value = true;
		loadError.value = "";
		try {
			orders.value = await adminFetch<Order[]>("/api/admin/orders");
		} catch (error) {
			loadError.value = fetchErrorMessage(error);
		} finally {
			loading.value = false;
		}
	};
	onMounted(loadOrders);

	/* ---------- list ---------- */

	// staff start on what needs doing
	const filter = ref<OrderStatus | "all">("paid");
	const countOf = (status: OrderStatus) =>
		orders.value.filter((order) => order.status === status).length;
	const filterItems = computed(() => [
		...ORDER_STATUSES.map(({ value, label }) => ({
			value,
			label: value === "paid" ? "To prepare" : label,
			badge:
				["needs_attention", "paid"].includes(value) && countOf(value)
					? String(countOf(value))
					: undefined,
		})),
		{ value: "all", label: "All" },
	]);
	// open on "Needs attention" when there is something there
	watch(
		() => countOf("needs_attention"),
		(count, before) => {
			if (count && !before) filter.value = "needs_attention";
		},
	);

	const shown = computed(() =>
		filter.value === "all"
			? orders.value
			: orders.value.filter((order) => order.status === filter.value),
	);

	const emptyMessage = computed(() => {
		if (filter.value === "all") return "No orders yet. They arrive from the shop.";
		if (filter.value === "paid") return "Nothing to prepare. Paid orders show up here.";
		return `No ${orderStatusLabel(filter.value).toLowerCase()} orders.`;
	});

	const columns: TableColumn<Order>[] = [
		{ accessorKey: "reference", header: "Order" },
		{ accessorKey: "customer_name", header: "Customer" },
		{ id: "items", header: "Items" },
		{ accessorKey: "total_kobo", header: "Total" },
		{ accessorKey: "status", header: "Status" },
	];

	// "Home jersey 2026 (M) ×2, Club cap"
	const itemSummary = (order: Order) =>
		order.items
			.map(
				(item) =>
					`${item.product_name} (${item.variant_label})${item.quantity > 1 ? ` ×${item.quantity}` : ""}`,
			)
			.join(", ");

	const statusColor = (status: OrderStatus) =>
		status === "needs_attention"
			? "warning"
			: status === "paid"
				? "primary"
				: "neutral";

	const formatDate = (date: string, withTime = false) =>
		new Date(date).toLocaleString("en-GB", {
			timeZone: CLUB_TIME_ZONE,
			day: "numeric",
			month: "short",
			year: "numeric",
			...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
		});

	/* ---------- one order ---------- */

	const selected = ref<Order | null>(null);
	const saving = ref<string | null>(null);
	const confirmCancel = ref(false);

	const open = (order: Order) => {
		selected.value = order;
	};

	// the usual next step for an order, as one button
	const nextStep = (order: Order) => {
		if (order.status === "paid")
			return {
				status: "ready" as const,
				label: order.fulfilment === "pickup" ? "Mark ready for pickup" : "Mark out for delivery",
			};
		if (order.status === "ready")
			return {
				status: "completed" as const,
				label: order.fulfilment === "pickup" ? "Mark collected" : "Mark delivered",
			};
		if (order.status === "needs_attention")
			return { status: "paid" as const, label: "Mark resolved" };
		return null;
	};

	const setStatus = async (status: "paid" | "ready" | "completed" | "cancelled") => {
		if (!selected.value) return;
		saving.value = status;
		try {
			const updated = await adminFetch<Order>(`/api/admin/orders/${selected.value.id}`, {
				method: "PATCH",
				body: { status },
			});
			orders.value = orders.value.map((order) => (order.id === updated.id ? updated : order));
			selected.value = updated;
			confirmCancel.value = false;
			refreshBadge();
			toast.add({
				title: `Order ${updated.reference}: ${orderStatusLabel(updated.status)}`,
				color: "success",
			});
		} catch (error) {
			toast.add({
				title: "Could not update the order",
				description: fetchErrorMessage(error),
				color: "error",
			});
		} finally {
			saving.value = null;
		}
	};
</script>
