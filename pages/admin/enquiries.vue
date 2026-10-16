<template>
	<Head>
		<Title>Sponsor enquiries | Valiant FC</Title>
	</Head>
	<section class="px-4">
		<h1 class="text-highlighted text-2xl max-w-[1100px] mx-auto my-6">
			Sponsor enquiries
		</h1>

		<div class="bg-default max-w-[1100px] mx-auto rounded-[8px] shadow-sm ring-1 ring-default my-10">
			<div
				class="flex flex-wrap items-center gap-2 p-4 justify-between border-b border-default"
			>
				<UTabs
					v-model="filter"
					:items="filterItems"
					:content="false"
					size="sm"
					class="w-auto"
				/>
				<UButton
					color="neutral"
					variant="ghost"
					icon="i-heroicons-arrow-path-20-solid"
					:loading="loading"
					@click="loadEnquiries"
				>
					Refresh
				</UButton>
			</div>

			<UAlert
				v-if="loadError"
				color="error"
				variant="subtle"
				icon="i-heroicons-exclamation-triangle"
				title="Could not load enquiries"
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
				<template #created_at-cell="{ row }">
					<span class="whitespace-nowrap">{{
						formatDate(row.original.created_at)
					}}</span>
				</template>
				<template #name-cell="{ row }">
					<div class="min-w-0">
						<p
							class="truncate text-highlighted"
							:class="row.original.status === 'new' ? 'font-semibold' : ''"
						>
							{{ row.original.name }}
						</p>
						<p v-if="row.original.company" class="truncate text-sm text-muted">
							{{ row.original.company }}
						</p>
					</div>
				</template>
				<template #message-cell="{ row }">
					<p class="max-w-md truncate text-muted">{{ row.original.message }}</p>
				</template>
				<template #status-cell="{ row }">
					<UBadge :color="statusColor(row.original.status)" variant="subtle">{{
						statusLabel(row.original.status)
					}}</UBadge>
				</template>

				<template #empty>
					<div class="flex flex-col items-center gap-2 py-10">
						<UIcon name="i-bi-inbox" class="text-3xl" />
						<span>{{
							filter === "all"
								? "No enquiries yet. They arrive from “Become a sponsor” on the home page."
								: `No ${statusLabel(filter as EnquiryStatus).toLowerCase()} enquiries.`
						}}</span>
					</div>
				</template>
			</UTable>
		</div>

		<USlideover
			:open="!!selected"
			:title="selected?.name"
			:description="
				selected ? `Received ${formatDate(selected.created_at, true)}` : ''
			"
			@update:open="
				(isOpen) => {
					if (!isOpen) selected = null;
				}
			"
		>
			<template #body>
				<div v-if="selected" class="flex flex-col gap-6">
					<dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
						<template v-if="selected.company">
							<dt class="text-muted">Company</dt>
							<dd class="text-highlighted">{{ selected.company }}</dd>
						</template>
						<dt class="text-muted">Email</dt>
						<dd>
							<a
								:href="`mailto:${selected.email}`"
								class="text-primary hover:underline break-all"
								>{{ selected.email }}</a
							>
						</dd>
						<template v-if="selected.phone">
							<dt class="text-muted">Phone</dt>
							<dd>
								<a
									:href="`tel:${selected.phone}`"
									class="text-primary hover:underline"
									>{{ selected.phone }}</a
								>
							</dd>
						</template>
					</dl>

					<div>
						<h3 class="mb-2 text-sm font-semibold text-highlighted">Message</h3>
						<p class="whitespace-pre-wrap text-default">{{ selected.message }}</p>
					</div>

					<UForm
						:state="edit"
						:schema="enquiryUpdateSchema"
						class="flex flex-col gap-4 border-t border-default pt-6"
						@submit="saveEnquiry"
					>
						<UFormField label="Status" name="status">
							<USelect v-model="edit.status" :items="statusItems" class="w-full" />
						</UFormField>
						<UFormField
							label="Notes"
							name="notes"
							hint="Only staff see these"
						>
							<UTextarea
								v-model="edit.notes"
								:rows="4"
								placeholder="e.g. Called on Monday, sending the sponsorship pack"
								class="w-full"
							/>
						</UFormField>
						<div class="flex justify-end gap-2">
							<UButton
								color="neutral"
								variant="ghost"
								:disabled="saving"
								@click="selected = null"
								>Close</UButton
							>
							<UButton type="submit" :loading="saving" class="px-6"
								>Save</UButton
							>
						</div>
					</UForm>
				</div>
			</template>
		</USlideover>
	</section>
</template>

<script setup lang="ts">
	import type { TableColumn } from "@nuxt/ui";
	import type { SponsorEnquiry } from "~/types/Sponsor";

	definePageMeta({
		layout: "admin",
	});

	const adminFetch = useAdminFetch();
	const toast = useToast();
	const { count: newCount } = useNewEnquiryCount();

	const enquiries = ref<SponsorEnquiry[]>([]);
	const loading = ref(false);
	const loadError = ref("");

	const loadEnquiries = async () => {
		loading.value = true;
		loadError.value = "";
		try {
			enquiries.value = await adminFetch<SponsorEnquiry[]>(
				"/api/admin/sponsor-enquiries",
			);
			syncBadge();
		} catch (error) {
			loadError.value = fetchErrorMessage(error);
		} finally {
			loading.value = false;
		}
	};
	onMounted(loadEnquiries);

	const syncBadge = () => {
		newCount.value = enquiries.value.filter((item) => item.status === "new").length;
	};

	/* ---------- list ---------- */

	// staff start on what still needs a reply
	const filter = ref<EnquiryStatus | "all">("new");
	const filterItems = computed(() => [
		...ENQUIRY_STATUSES.map(({ value, label }) => ({
			value,
			label,
			badge:
				value === "new" && newCount.value > 0 ? String(newCount.value) : undefined,
		})),
		{ value: "all", label: "All" },
	]);
	const shown = computed(() =>
		filter.value === "all"
			? enquiries.value
			: enquiries.value.filter((item) => item.status === filter.value),
	);

	const columns: TableColumn<SponsorEnquiry>[] = [
		{ accessorKey: "created_at", header: "Received" },
		{ accessorKey: "name", header: "From" },
		{ accessorKey: "message", header: "Message" },
		{ accessorKey: "status", header: "Status" },
	];

	const statusItems = ENQUIRY_STATUSES.map(({ value, label }) => ({ value, label }));
	const statusLabel = (status: EnquiryStatus) =>
		ENQUIRY_STATUSES.find((item) => item.value === status)?.label ?? status;
	const statusColor = (status: EnquiryStatus) =>
		status === "new" ? "primary" : "neutral";

	const formatDate = (date: string, withTime = false) =>
		new Date(date).toLocaleString("en-GB", {
			timeZone: CLUB_TIME_ZONE,
			day: "numeric",
			month: "short",
			year: "numeric",
			...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
		});

	/* ---------- one enquiry ---------- */

	const selected = ref<SponsorEnquiry | null>(null);
	const edit = reactive<EnquiryUpdate>({ status: "new", notes: "" });
	const saving = ref(false);

	const open = (enquiry: SponsorEnquiry) => {
		selected.value = enquiry;
		// opening a new enquiry is the moment someone starts handling it
		edit.status = enquiry.status === "new" ? "contacted" : enquiry.status;
		edit.notes = enquiry.notes;
	};

	const saveEnquiry = async () => {
		if (!selected.value) return;
		saving.value = true;
		try {
			const updated = await adminFetch<SponsorEnquiry>(
				`/api/admin/sponsor-enquiries/${selected.value.id}`,
				{ method: "PATCH", body: { ...edit } },
			);
			enquiries.value = enquiries.value.map((item) =>
				item.id === updated.id ? updated : item,
			);
			syncBadge();
			toast.add({
				title: "Enquiry updated",
				description: `${updated.name}: ${statusLabel(updated.status)}`,
				color: "success",
			});
			selected.value = null;
		} catch (error) {
			toast.add({
				title: "Could not update the enquiry",
				description: fetchErrorMessage(error),
				color: "error",
			});
		} finally {
			saving.value = false;
		}
	};
</script>
