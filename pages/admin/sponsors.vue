<template>
	<Head>
		<Title>Sponsors | Valiant FC</Title>
	</Head>
	<section class="px-4">
		<h1 class="text-highlighted text-2xl max-w-[1100px] mx-auto my-6">
			Sponsors
		</h1>

		<div class="bg-default max-w-[1100px] mx-auto rounded-[8px] shadow-sm ring-1 ring-default my-10">
			<div
				class="flex flex-wrap items-center gap-2 p-4 justify-between border-b border-default"
			>
				<UButton icon="i-heroicons-plus-20-solid" @click="openForm()"
					>Add sponsor</UButton
				>
				<UButton
					color="neutral"
					variant="ghost"
					icon="i-heroicons-arrow-path-20-solid"
					:loading="loading"
					@click="loadSponsors"
				>
					Refresh
				</UButton>
			</div>

			<UAlert
				v-if="loadError"
				color="error"
				variant="subtle"
				icon="i-heroicons-exclamation-triangle"
				title="Could not load sponsors"
				:description="loadError"
				class="m-4 w-auto"
			/>

			<UTable :data="sponsors" :columns="columns" :loading="loading">
				<template #name-cell="{ row }">
					<div class="flex items-center gap-3">
						<div
							class="grid h-10 w-20 shrink-0 place-items-center overflow-hidden rounded-md ring-1 ring-default"
						>
							<img
								v-if="row.original.logo_url"
								:src="row.original.logo_url"
								alt=""
								class="max-h-full max-w-full object-contain p-1"
							/>
							<UIcon v-else name="i-bi-image" class="size-5 text-dimmed" />
						</div>
						<span class="font-medium text-highlighted">{{
							row.original.name
						}}</span>
					</div>
				</template>
				<template #tier-cell="{ row }">
					<UBadge
						:color="row.original.tier === 'main' ? 'primary' : 'neutral'"
						variant="subtle"
						>{{ tierLabel(row.original.tier) }}</UBadge
					>
				</template>
				<template #website_url-cell="{ row }">
					<a
						v-if="row.original.website_url"
						:href="row.original.website_url"
						target="_blank"
						rel="noopener"
						class="text-primary hover:underline"
						>{{ hostOf(row.original.website_url) }}</a
					>
					<span v-else class="text-muted">None</span>
				</template>
				<template #is_active-cell="{ row }">
					<span :class="row.original.is_active ? 'text-default' : 'text-muted'">{{
						row.original.is_active ? "Shown" : "Hidden"
					}}</span>
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
						<UIcon name="i-bi-building" class="text-3xl" />
						<span>No sponsors yet.</span>
						<UButton variant="link" @click="openForm()">
							Add the first sponsor
						</UButton>
					</div>
				</template>
			</UTable>
		</div>

		<UModal
			v-model:open="formOpen"
			:title="editing ? 'Edit sponsor' : 'Add a new sponsor'"
			:description="
				editing
					? 'Update how this sponsor appears on the home page.'
					: 'Sponsors appear in the home page sponsors section.'
			"
			:ui="{
				title: 'text-primary font-bold text-xl',
				description: 'text-sm text-muted',
			}"
		>
			<template #body>
				<AdminSponsorForm
					:key="editing?.id ?? 'new'"
					:sponsor="editing"
					:loading="saving"
					@submit="saveSponsor"
					@cancel="formOpen = false"
				/>
			</template>
		</UModal>

		<UModal
			:open="!!toDelete"
			:title="`Delete ${toDelete?.name}?`"
			description="This cannot be undone. To take a sponsor off the website for now, edit it and turn off “Show on the website”."
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
					<UButton color="error" :loading="deleting" @click="deleteSponsor"
						>Delete</UButton
					>
				</div>
			</template>
		</UModal>
	</section>
</template>

<script setup lang="ts">
	import type { TableColumn } from "@nuxt/ui";
	import type { Sponsor } from "~/types/Sponsor";

	definePageMeta({
		layout: "admin",
	});

	const adminFetch = useAdminFetch();
	const uploadImage = useImageUpload();
	const toast = useToast();

	const sponsors = ref<Sponsor[]>([]);
	const loading = ref(false);
	const loadError = ref("");

	const loadSponsors = async () => {
		loading.value = true;
		loadError.value = "";
		try {
			sponsors.value = await adminFetch<Sponsor[]>("/api/admin/sponsors");
		} catch (error) {
			loadError.value = fetchErrorMessage(error);
		} finally {
			loading.value = false;
		}
	};
	onMounted(loadSponsors);

	const columns: TableColumn<Sponsor>[] = [
		{ accessorKey: "name", header: "Sponsor" },
		{ accessorKey: "tier", header: "Tier" },
		{ accessorKey: "website_url", header: "Website" },
		{ accessorKey: "is_active", header: "On website" },
		{ accessorKey: "display_order", header: "Order" },
		{ id: "actions" },
	];

	const tierLabel = (tier: SponsorTier) =>
		SPONSOR_TIERS.find((item) => item.value === tier)?.label ?? tier;

	// "https://www.example.com/about" -> "example.com"
	const hostOf = (url: string) => {
		try {
			return new URL(url).hostname.replace(/^www\./, "");
		} catch {
			return url;
		}
	};

	// the same order as the home page: main sponsor first, then by order and name
	const homePageOrder = (a: Sponsor, b: Sponsor) =>
		a.tier.localeCompare(b.tier) ||
		a.display_order - b.display_order ||
		a.name.localeCompare(b.name);

	const rowActions = (sponsor: Sponsor) => [
		[
			{
				label: "Edit",
				icon: "i-heroicons-pencil-square-20-solid",
				onSelect: () => openForm(sponsor),
			},
			{
				label: "Delete",
				icon: "i-heroicons-trash-20-solid",
				color: "error" as const,
				onSelect: () => {
					toDelete.value = sponsor;
				},
			},
		],
	];

	/* ---------- add and edit ---------- */

	const formOpen = ref(false);
	const editing = ref<Sponsor | null>(null);
	const saving = ref(false);

	const openForm = (sponsor: Sponsor | null = null) => {
		editing.value = sponsor;
		formOpen.value = true;
	};

	const saveSponsor = async (sponsor: SponsorInput, logo: File | null) => {
		saving.value = true;
		try {
			if (logo)
				sponsor = { ...sponsor, logo_url: await uploadImage(logo, "sponsors") };

			if (editing.value) {
				const updated = await adminFetch<Sponsor>(
					`/api/admin/sponsors/${editing.value.id}`,
					{ method: "PATCH", body: sponsor },
				);
				sponsors.value = sponsors.value
					.map((item) => (item.id === updated.id ? updated : item))
					.sort(homePageOrder);
			} else {
				const created = await adminFetch<Sponsor>("/api/admin/sponsors", {
					method: "POST",
					body: sponsor,
				});
				sponsors.value = [...sponsors.value, created].sort(homePageOrder);
			}
			toast.add({
				title: editing.value ? "Sponsor updated" : "Sponsor added",
				description: sponsor.name,
				color: "success",
			});
			formOpen.value = false;
		} catch (error) {
			toast.add({
				title: "Could not save the sponsor",
				description: fetchErrorMessage(error),
				color: "error",
			});
		} finally {
			saving.value = false;
		}
	};

	/* ---------- delete ---------- */

	const toDelete = ref<Sponsor | null>(null);
	const deleting = ref(false);

	const deleteSponsor = async () => {
		if (!toDelete.value) return;
		deleting.value = true;
		try {
			const { deleted } = await adminFetch<{ deleted: number }>(
				`/api/admin/sponsors/${toDelete.value.id}`,
				{ method: "DELETE" },
			);
			sponsors.value = sponsors.value.filter((item) => item.id !== deleted);
			toast.add({
				title: "Sponsor deleted",
				description: toDelete.value.name,
				color: "success",
			});
			toDelete.value = null;
		} catch (error) {
			toast.add({
				title: "Could not delete the sponsor",
				description: fetchErrorMessage(error),
				color: "error",
			});
		} finally {
			deleting.value = false;
		}
	};
</script>
