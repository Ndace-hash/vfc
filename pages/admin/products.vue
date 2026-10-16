<template>
	<Head>
		<Title>Products | Valiant FC</Title>
	</Head>
	<section class="px-4">
		<h1 class="text-highlighted text-2xl max-w-[1100px] mx-auto my-6">
			Products
		</h1>

		<div class="bg-default max-w-[1100px] mx-auto rounded-[8px] shadow-sm ring-1 ring-default my-10">
			<div
				class="flex flex-wrap items-center gap-2 p-4 justify-between border-b border-default"
			>
				<UButton icon="i-heroicons-plus-20-solid" @click="openForm()"
					>Add product</UButton
				>
				<div class="flex items-center gap-2">
					<UButton
						color="neutral"
						variant="ghost"
						icon="i-heroicons-arrow-path-20-solid"
						:loading="loading"
						@click="loadProducts"
					>
						Refresh
					</UButton>
					<UInput
						v-model="search"
						icon="i-heroicons-magnifying-glass-20-solid"
						placeholder="Search products..."
						class="w-56"
					/>
				</div>
			</div>

			<UAlert
				v-if="loadError"
				color="error"
				variant="subtle"
				icon="i-heroicons-exclamation-triangle"
				title="Could not load products"
				:description="loadError"
				class="m-4 w-auto"
			/>

			<UTable
				v-model:global-filter="search"
				:data="products"
				:columns="columns"
				:loading="loading"
			>
				<template #name-cell="{ row }">
					<div class="flex items-center gap-3">
						<div
							class="size-12 shrink-0 overflow-hidden rounded-md bg-elevated ring-1 ring-default"
						>
							<img
								v-if="row.original.image_urls[0]"
								:src="row.original.image_urls[0]"
								alt=""
								class="size-full object-cover"
							/>
						</div>
						<div class="min-w-0">
							<p class="truncate font-medium text-highlighted">
								{{ row.original.name }}
							</p>
							<p class="truncate text-sm text-muted">/shop/{{ row.original.slug }}</p>
						</div>
					</div>
				</template>
				<template #price_kobo-cell="{ row }">
					{{ formatNaira(row.original.price_kobo) }}
				</template>
				<template #stock-cell="{ row }">
					<span :class="stockOf(row.original) === 0 ? 'text-error' : ''">{{
						stockSummary(row.original)
					}}</span>
				</template>
				<template #is_active-cell="{ row }">
					<div class="flex flex-wrap gap-1">
						<UBadge
							:color="row.original.is_active ? 'primary' : 'neutral'"
							variant="subtle"
							>{{ row.original.is_active ? "Published" : "Hidden" }}</UBadge
						>
						<UBadge v-if="row.original.is_featured" color="neutral" variant="outline"
							>Featured</UBadge
						>
					</div>
				</template>
				<template #actions-cell="{ row }">
					<UDropdownMenu :items="rowActions(row.original)">
						<UButton
							color="neutral"
							variant="ghost"
							icon="i-heroicons-ellipsis-horizontal-20-solid"
							:aria-label="`Actions for ${row.original.name}`"
						/>
					</UDropdownMenu>
				</template>

				<template #empty>
					<div class="flex flex-col items-center gap-2 py-10">
						<UIcon name="i-bi-bag" class="text-3xl" />
						<span>{{
							search ? "No products match your search." : "No products yet."
						}}</span>
						<UButton v-if="!search" variant="link" @click="openForm()">
							Add the first product
						</UButton>
					</div>
				</template>
			</UTable>
		</div>

		<USlideover
			v-model:open="formOpen"
			:title="editing ? 'Edit product' : 'Add a product'"
			:description="
				editing
					? 'Changes show in the shop as soon as you save.'
					: 'New products stay hidden until you publish them.'
			"
			:ui="{
				content: 'sm:max-w-xl',
				title: 'text-primary font-bold text-xl',
				description: 'text-sm text-muted',
			}"
		>
			<template #body>
				<AdminProductForm
					:key="editing?.id ?? 'new'"
					:product="editing"
					:loading="saving"
					@submit="saveProduct"
					@cancel="formOpen = false"
				/>
			</template>
		</USlideover>

		<UModal
			:open="!!toDelete"
			:title="`Delete ${toDelete?.name}?`"
			description="This cannot be undone. To take a product out of the shop for now, edit it and turn off “Published”."
			@update:open="
				(open) => {
					if (!open) toDelete = null;
				}
			"
		>
			<template #body>
				<div class="flex justify-end gap-2">
					<UButton
						color="neutral"
						variant="ghost"
						:disabled="deleting"
						@click="toDelete = null"
						>Cancel
					</UButton>
					<UButton color="error" :loading="deleting" @click="deleteProduct"
						>Delete</UButton
					>
				</div>
			</template>
		</UModal>
	</section>
</template>

<script setup lang="ts">
	import type { TableColumn } from "@nuxt/ui";
	import type { AdminProduct } from "~/types/Shop";

	definePageMeta({
		layout: "admin",
	});

	const adminFetch = useAdminFetch();
	const toast = useToast();

	const products = ref<AdminProduct[]>([]);
	const loading = ref(false);
	const loadError = ref("");
	const search = ref("");

	const loadProducts = async () => {
		loading.value = true;
		loadError.value = "";
		try {
			products.value = await adminFetch<AdminProduct[]>("/api/admin/products");
		} catch (error) {
			loadError.value = fetchErrorMessage(error);
		} finally {
			loading.value = false;
		}
	};
	onMounted(loadProducts);

	const columns: TableColumn<AdminProduct>[] = [
		{ accessorKey: "name", header: "Product" },
		{ accessorKey: "price_kobo", header: "Price", enableGlobalFilter: false },
		{ id: "stock", header: "Stock" },
		{ accessorKey: "is_active", header: "Status", enableGlobalFilter: false },
		{ id: "actions" },
	];

	// stock across the sizes that are for sale
	const stockOf = (product: AdminProduct) =>
		product.variants
			.filter((variant) => variant.is_active)
			.reduce((sum, variant) => sum + variant.stock, 0);

	// "27 in stock · 1 size sold out"
	const stockSummary = (product: AdminProduct) => {
		const total = stockOf(product);
		if (total === 0) return "Sold out";
		const soldOut = product.variants.filter(
			(variant) => variant.is_active && variant.stock === 0,
		).length;
		return soldOut
			? `${total} in stock · ${soldOut} sold out`
			: `${total} in stock`;
	};

	const shopOrder = (a: AdminProduct, b: AdminProduct) =>
		a.display_order - b.display_order || a.name.localeCompare(b.name);

	const rowActions = (product: AdminProduct) => [
		[
			{
				label: "Edit",
				icon: "i-heroicons-pencil-square-20-solid",
				onSelect: () => openForm(product),
			},
			...(product.is_active
				? [
						{
							label: "View in shop",
							icon: "i-bi-box-arrow-up-right",
							to: `/shop/${product.slug}`,
							target: "_blank",
						},
					]
				: []),
			{
				label: "Delete",
				icon: "i-heroicons-trash-20-solid",
				color: "error" as const,
				onSelect: () => {
					toDelete.value = product;
				},
			},
		],
	];

	/* ---------- add and edit ---------- */

	const formOpen = ref(false);
	const editing = ref<AdminProduct | null>(null);
	const saving = ref(false);

	const openForm = (product: AdminProduct | null = null) => {
		editing.value = product;
		formOpen.value = true;
	};

	const saveProduct = async (product: ProductInput) => {
		saving.value = true;
		try {
			const saved = await adminFetch<AdminProduct>(
				editing.value
					? `/api/admin/products/${editing.value.id}`
					: "/api/admin/products",
				{ method: editing.value ? "PATCH" : "POST", body: product },
			);
			products.value = [
				...products.value.filter((item) => item.id !== saved.id),
				saved,
			].sort(shopOrder);
			toast.add({
				title: editing.value ? "Product updated" : "Product added",
				description: saved.is_active
					? saved.name
					: `${saved.name} is hidden until you publish it.`,
				color: "success",
			});
			formOpen.value = false;
		} catch (error) {
			toast.add({
				title: "Could not save the product",
				description: fetchErrorMessage(error),
				color: "error",
			});
		} finally {
			saving.value = false;
		}
	};

	/* ---------- delete ---------- */

	const toDelete = ref<AdminProduct | null>(null);
	const deleting = ref(false);

	const deleteProduct = async () => {
		if (!toDelete.value) return;
		deleting.value = true;
		try {
			const { deleted } = await adminFetch<{ deleted: number }>(
				`/api/admin/products/${toDelete.value.id}`,
				{ method: "DELETE" },
			);
			products.value = products.value.filter((item) => item.id !== deleted);
			toast.add({
				title: "Product deleted",
				description: toDelete.value.name,
				color: "success",
			});
			toDelete.value = null;
		} catch (error) {
			toast.add({
				title: "Could not delete the product",
				description: fetchErrorMessage(error),
				color: "error",
			});
		} finally {
			deleting.value = false;
		}
	};
</script>
