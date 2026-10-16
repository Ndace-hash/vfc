<template>
	<Head>
		<Title>Players | Valiant FC</Title>
	</Head>
	<section class="px-4">
		<h1 class="text-highlighted capitalize text-2xl max-w-[1100px] mx-auto my-6">
			Team <span class="font-semibold">Management</span>
		</h1>

		<div class="bg-default max-w-[1100px] mx-auto rounded-[8px] shadow-sm ring-1 ring-default my-10">
			<div
				class="flex flex-wrap items-center gap-2 p-4 justify-between border-b border-default"
			>
				<div class="flex flex-wrap items-center gap-2">
					<UButton icon="i-heroicons-plus-20-solid" @click="openForm()"
						>Add player</UButton
					>
					<UButton
						color="neutral"
						variant="outline"
						icon="i-heroicons-arrow-up-tray-20-solid"
						@click="importOpen = true"
					>
						Import
					</UButton>
					<UButton
						v-if="selected.length"
						color="error"
						variant="soft"
						icon="i-heroicons-trash-20-solid"
						@click="toDelete = selected"
					>
						Delete {{ selected.length }} selected
					</UButton>
				</div>
				<div class="flex items-center gap-2">
					<UButton
						color="neutral"
						variant="ghost"
						icon="i-heroicons-arrow-path-20-solid"
						:loading="loading"
						@click="loadPlayers"
					>
						Refresh
					</UButton>
					<UInput
						v-model="search"
						icon="i-heroicons-magnifying-glass-20-solid"
						placeholder="Search players..."
						class="w-56"
					/>
				</div>
			</div>

			<UAlert
				v-if="loadError"
				color="error"
				variant="subtle"
				icon="i-heroicons-exclamation-triangle"
				title="Could not load players"
				:description="loadError"
				class="m-4 w-auto"
			/>

			<UTable
				ref="table"
				v-model:sorting="sorting"
				v-model:pagination="pagination"
				v-model:row-selection="rowSelection"
				v-model:global-filter="search"
				:data="players"
				:columns="columns"
				:get-row-id="(player: Player) => player.id"
				:loading="loading"
				:pagination-options="{ getPaginationRowModel: getPaginationRowModel() }"
			>
				<template #select-header="{ table: api }">
					<UCheckbox
						:model-value="
							api.getIsSomePageRowsSelected()
								? 'indeterminate'
								: api.getIsAllPageRowsSelected()
						"
						aria-label="Select all players on this page"
						@update:model-value="
							(value) => api.toggleAllPageRowsSelected(!!value)
						"
					/>
				</template>
				<template #select-cell="{ row }">
					<UCheckbox
						:model-value="row.getIsSelected()"
						:aria-label="`Select ${row.original.full_name}`"
						@update:model-value="(value) => row.toggleSelected(!!value)"
					/>
				</template>

				<template
					v-for="column in SORTABLE"
					:key="column.id"
					#[`${column.id}-header`]="{ column: api }"
				>
					<UButton
						color="neutral"
						variant="ghost"
						class="-mx-2.5"
						:label="column.label"
						:trailing-icon="sortIcon(api.getIsSorted())"
						@click="api.toggleSorting(api.getIsSorted() === 'asc')"
					/>
				</template>

				<template #full_name-cell="{ row }">
					<div class="flex items-center gap-3">
						<UAvatar
							:src="row.original.photo_url ?? undefined"
							:alt="row.original.full_name"
							icon="i-heroicons-user-20-solid"
						/>
						<span class="font-medium text-highlighted">{{
							row.original.full_name
						}}</span>
					</div>
				</template>
				<template #date_of_birth-cell="{ row }">
					<template v-if="row.original.date_of_birth">
						{{ ageOf(row.original.date_of_birth) }}
						<span class="text-muted text-xs ms-1">{{
							formatDate(row.original.date_of_birth)
						}}</span>
					</template>
				</template>
				<template #position-cell="{ row }">
					<span class="font-medium">{{ row.original.position }}</span>
					<span class="text-muted text-xs ms-1.5">
						{{ playerPosition(row.original.position)?.label }}
					</span>
				</template>
				<template #preferred_foot-cell="{ row }">
					<span class="capitalize">{{ row.original.preferred_foot }}</span>
				</template>
				<template #is_active-cell="{ row }">
					<UBadge
						:color="row.original.is_active ? 'success' : 'neutral'"
						variant="subtle"
					>
						{{ row.original.is_active ? "Active" : "Inactive" }}
					</UBadge>
				</template>
				<template #actions-cell="{ row }">
					<UDropdownMenu :items="rowActions(row.original)">
						<UButton
							color="neutral"
							variant="ghost"
							icon="i-heroicons-ellipsis-horizontal-20-solid"
							:aria-label="`Actions for ${row.original.full_name}`"
						/>
					</UDropdownMenu>
				</template>

				<template #empty>
					<div class="flex flex-col items-center gap-2 py-10">
						<UIcon name="i-heroicons-users" class="text-3xl" />
						<span>{{
							search ? "No players match your search." : "No players yet."
						}}</span>
						<UButton v-if="!search" variant="link" @click="importOpen = true">
							Import players from a spreadsheet
						</UButton>
					</div>
				</template>
			</UTable>

			<div
				class="flex flex-wrap items-center justify-between gap-2 p-4 border-t border-default text-sm"
			>
				<span class="text-muted">{{ rangeLabel }}</span>
				<UPagination
					v-if="filteredCount > pagination.pageSize"
					:page="pagination.pageIndex + 1"
					:items-per-page="pagination.pageSize"
					:total="filteredCount"
					@update:page="goToPage"
				/>
			</div>
		</div>

		<UModal
			v-model:open="formOpen"
			:title="editing ? 'Edit player' : 'Add a new player'"
			:description="
				editing
					? 'Update the player\'s details.'
					: 'Fill out the form to add a new player.'
			"
			:ui="{
				title: 'text-primary font-bold text-xl',
				description: 'text-sm text-muted',
			}"
		>
			<template #body>
				<AdminPlayerForm
					:key="editing?.id ?? 'new'"
					:player="editing"
					:loading="saving"
					@submit="savePlayer"
					@cancel="formOpen = false"
				/>
			</template>
		</UModal>

		<UModal
			v-model:open="importOpen"
			title="Import players"
			description="Add many players at once from a CSV or Excel file."
			:ui="{
				content: 'sm:max-w-5xl',
				title: 'text-primary font-bold text-xl',
				description: 'text-sm text-muted',
			}"
		>
			<template #body>
				<AdminPlayerImport
					:existing="players"
					@imported="addImported"
					@close="importOpen = false"
				/>
			</template>
		</UModal>

		<UModal
			:open="toDelete.length > 0"
			:title="
				toDelete.length === 1
					? `Delete ${toDelete[0]?.full_name}?`
					: `Delete ${toDelete.length} players?`
			"
			description="This cannot be undone."
			@update:open="
				(open) => {
					if (!open) toDelete = [];
				}
			"
		>
			<template #body>
				<ul
					v-if="toDelete.length > 1"
					class="text-sm mb-4 max-h-40 overflow-y-auto list-disc ps-5"
				>
					<li v-for="player in toDelete" :key="player.id">
						{{ player.full_name }}
					</li>
				</ul>
				<div class="flex justify-end gap-2">
					<UButton
						color="neutral"
						variant="ghost"
						:disabled="deleting"
						@click="toDelete = []"
						>Cancel
					</UButton>
					<UButton color="error" :loading="deleting" @click="deletePlayers"
						>Delete</UButton
					>
				</div>
			</template>
		</UModal>
	</section>
</template>

<script setup lang="ts">
	import { getPaginationRowModel } from "@tanstack/vue-table";
	import type { TableColumn } from "@nuxt/ui";
	import type { Player } from "~/types/Player";

	definePageMeta({
		layout: "admin",
	});

	const adminFetch = useAdminFetch();
	const uploadImage = useImageUpload();
	const toast = useToast();

	const players = ref<Player[]>([]);
	const loading = ref(false);
	const loadError = ref("");

	const loadPlayers = async () => {
		loading.value = true;
		loadError.value = "";
		try {
			players.value = await adminFetch<Player[]>("/api/admin/players");
			rowSelection.value = {};
		} catch (error) {
			loadError.value = fetchErrorMessage(error);
		} finally {
			loading.value = false;
		}
	};
	onMounted(loadPlayers);

	/* ---------- table ---------- */

	const SORTABLE = [
		{ id: "full_name", label: "Player" },
		{ id: "position", label: "Position" },
		{ id: "jersey_number", label: "Jersey" },
		{ id: "date_of_birth", label: "Age" },
		{ id: "nationality", label: "Nationality" },
		{ id: "is_active", label: "Status" },
	] as const;

	const positionOrder = (code: string | null) => {
		const index = PLAYER_POSITION_CODES.indexOf(code as PlayerPositionCode);
		return index === -1 ? PLAYER_POSITION_CODES.length : index;
	};

	const columns: TableColumn<Player>[] = [
		{ id: "select", enableSorting: false },
		...SORTABLE.map(({ id }): TableColumn<Player> =>
			id === "position"
				? {
						accessorKey: id,
						// goalkeepers first, strikers last, instead of alphabetical codes
						sortingFn: (a, b) =>
							positionOrder(a.original.position) -
							positionOrder(b.original.position),
					}
				: { accessorKey: id },
		),
		{ accessorKey: "preferred_foot", header: "Foot", enableSorting: false },
		{ id: "actions", enableSorting: false },
	];

	const table = useTemplateRef("table");
	const search = ref("");
	const sorting = ref([{ id: "full_name", desc: false }]);
	const pagination = ref({ pageIndex: 0, pageSize: 10 });
	const rowSelection = ref<Record<string, boolean>>({});

	const sortIcon = (sorted: false | "asc" | "desc") =>
		sorted === "asc"
			? "i-heroicons-bars-arrow-up-20-solid"
			: sorted === "desc"
				? "i-heroicons-bars-arrow-down-20-solid"
				: "i-heroicons-arrows-up-down-20-solid";

	const selected = computed(() =>
		players.value.filter((player) => rowSelection.value[player.id]),
	);

	const filteredCount = computed(
		() =>
			table.value?.tableApi.getFilteredRowModel().rows.length ??
			players.value.length,
	);
	const rangeLabel = computed(() => {
		const total = filteredCount.value;
		if (!total) return "";
		const first = pagination.value.pageIndex * pagination.value.pageSize + 1;
		const last = Math.min(first + pagination.value.pageSize - 1, total);
		return `Showing ${first}-${last} of ${total} ${total === 1 ? "player" : "players"}`;
	});

	// the table only notices a new pagination object, not a changed property
	const goToPage = (page: number) => {
		pagination.value = { ...pagination.value, pageIndex: page - 1 };
	};

	// searching can leave the current page past the end of the results
	watch(search, () => goToPage(1));

	const formatDate = (date: string) =>
		new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
			day: "numeric",
			month: "short",
			year: "numeric",
		});

	const ageOf = (dateOfBirth: string) => {
		const born = new Date(`${dateOfBirth}T00:00:00`);
		const now = new Date();
		const hadBirthday =
			now.getMonth() > born.getMonth() ||
			(now.getMonth() === born.getMonth() && now.getDate() >= born.getDate());
		return now.getFullYear() - born.getFullYear() - (hadBirthday ? 0 : 1);
	};

	const rowActions = (player: Player) => [
		[
			{
				label: "Edit",
				icon: "i-heroicons-pencil-square-20-solid",
				onSelect: () => openForm(player),
			},
			{
				label: "Delete",
				icon: "i-heroicons-trash-20-solid",
				color: "error" as const,
				onSelect: () => {
					toDelete.value = [player];
				},
			},
		],
	];

	/* ---------- add and edit ---------- */

	const formOpen = ref(false);
	const editing = ref<Player | null>(null);
	const saving = ref(false);

	const openForm = (player: Player | null = null) => {
		editing.value = player;
		formOpen.value = true;
	};

	const savePlayer = async (player: PlayerInput, photo: File | null) => {
		saving.value = true;
		try {
			if (photo)
				player = {
					...player,
					photo_url: await uploadImage(photo, "players"),
				};

			if (editing.value) {
				const updated = await adminFetch<Player>(
					`/api/admin/players/${editing.value.id}`,
					{ method: "PATCH", body: player },
				);
				players.value = players.value.map((other) =>
					other.id === updated.id ? updated : other,
				);
			} else {
				players.value.push(
					await adminFetch<Player>("/api/admin/players", {
						method: "POST",
						body: player,
					}),
				);
			}
			toast.add({
				title: editing.value ? "Player updated" : "Player added",
				description: player.full_name,
				color: "success",
			});
			formOpen.value = false;
		} catch (error) {
			toast.add({
				title: "Could not save the player",
				description: fetchErrorMessage(error),
				color: "error",
			});
		} finally {
			saving.value = false;
		}
	};

	/* ---------- import ---------- */

	const importOpen = ref(false);

	const addImported = (imported: Player[]) => {
		players.value.push(...imported);
	};

	/* ---------- delete ---------- */

	const toDelete = ref<Player[]>([]);
	const deleting = ref(false);

	const deletePlayers = async () => {
		deleting.value = true;
		try {
			const { deleted } = await adminFetch<{ deleted: string[] }>(
				"/api/admin/players",
				{
					method: "DELETE",
					body: { ids: toDelete.value.map((player) => player.id) },
				},
			);
			players.value = players.value.filter(
				(player) => !deleted.includes(player.id),
			);
			rowSelection.value = {};
			toast.add({
				title: `${deleted.length} ${deleted.length === 1 ? "player" : "players"} deleted`,
				color: "success",
			});
			toDelete.value = [];
		} catch (error) {
			toast.add({
				title: "Could not delete",
				description: fetchErrorMessage(error),
				color: "error",
			});
		} finally {
			deleting.value = false;
		}
	};
</script>
