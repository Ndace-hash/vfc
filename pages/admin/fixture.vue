<template>
	<Head>
		<Title>Fixtures | Valiant FC</Title>
	</Head>
	<section class="px-4">
		<h1 class="text-highlighted capitalize text-2xl max-w-[1100px] mx-auto my-6">
			Fixtures
		</h1>

		<div class="bg-default max-w-[1100px] mx-auto rounded-[8px] shadow-sm ring-1 ring-default my-10">
			<div
				class="flex flex-wrap items-center gap-2 p-4 justify-between border-b border-default"
			>
				<div class="flex flex-wrap items-center gap-2">
					<UButton
						icon="i-heroicons-plus-20-solid"
						:disabled="teams.length < 2"
						@click="openForm()"
						>Add fixture</UButton
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
						@click="load"
					>
						Refresh
					</UButton>
					<UInput
						v-model="search"
						icon="i-heroicons-magnifying-glass-20-solid"
						placeholder="Search by team..."
						class="w-56"
					/>
				</div>
			</div>

			<UAlert
				v-if="loadError"
				color="error"
				variant="subtle"
				icon="i-heroicons-exclamation-triangle"
				title="Could not load fixtures"
				:description="loadError"
				class="m-4 w-auto"
			/>
			<UAlert
				v-else-if="!loading && teams.length < 2"
				color="neutral"
				variant="subtle"
				icon="i-heroicons-information-circle"
				title="Add at least two teams before adding fixtures"
				description="Teams can also be created while importing a spreadsheet."
				class="m-4 w-auto"
				:actions="[
					{
						label: 'Go to Teams',
						to: '/admin/teams',
						color: 'neutral',
						variant: 'outline',
					},
				]"
			/>

			<UTable
				ref="table"
				v-model:sorting="sorting"
				v-model:pagination="pagination"
				v-model:row-selection="rowSelection"
				v-model:global-filter="search"
				:data="rows"
				:columns="columns"
				:get-row-id="(row: FixtureRow) => String(row.id)"
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
						aria-label="Select all fixtures on this page"
						@update:model-value="
							(value) => api.toggleAllPageRowsSelected(!!value)
						"
					/>
				</template>
				<template #select-cell="{ row }">
					<UCheckbox
						:model-value="row.getIsSelected()"
						:aria-label="`Select ${row.original.homeName} v ${row.original.awayName}`"
						@update:model-value="(value) => row.toggleSelected(!!value)"
					/>
				</template>

				<template #start_time-header="{ column }">
					<UButton
						color="neutral"
						variant="ghost"
						class="-mx-2.5"
						label="Kick-off"
						:trailing-icon="sortIcon(column.getIsSorted())"
						@click="column.toggleSorting(column.getIsSorted() === 'asc')"
					/>
				</template>
				<template #start_time-cell="{ row }">
					<template v-if="row.original.start_time">
						{{ formatKickoffDay(row.original.start_time) }}
						<span class="text-muted ms-1">{{
							kickoffParts(row.original.start_time).time
						}}</span>
					</template>
				</template>
				<template #homeName-cell="{ row }">
					<div class="flex items-center gap-2 justify-end text-right">
						<span class="font-medium text-highlighted">{{
							row.original.homeName
						}}</span>
						<TeamCrest
							:name="row.original.homeName"
							:crest-url="row.original.homeCrest"
							class="size-7 shrink-0"
						/>
					</div>
				</template>
				<template #score-cell="{ row }">
					<span
						v-if="row.original.home_score !== null"
						class="font-bold tabular-nums"
						>{{ row.original.home_score }} - {{ row.original.away_score }}</span
					>
					<span v-else class="text-muted">v</span>
				</template>
				<template #awayName-cell="{ row }">
					<div class="flex items-center gap-2">
						<TeamCrest
							:name="row.original.awayName"
							:crest-url="row.original.awayCrest"
							class="size-7 shrink-0"
						/>
						<span class="font-medium text-highlighted">{{
							row.original.awayName
						}}</span>
					</div>
				</template>
				<template #state-cell="{ row }">
					<UBadge :color="STATE[row.original.state].color" variant="subtle">
						{{ STATE[row.original.state].label }}
					</UBadge>
				</template>
				<template #actions-cell="{ row }">
					<UDropdownMenu :items="rowActions(row.original)">
						<UButton
							color="neutral"
							variant="ghost"
							icon="i-heroicons-ellipsis-horizontal-20-solid"
							aria-label="Fixture actions"
						/>
					</UDropdownMenu>
				</template>

				<template #empty>
					<div class="flex flex-col items-center gap-2 py-10">
						<UIcon name="i-heroicons-calendar-days" class="text-3xl" />
						<span>{{
							search ? "No fixtures match your search." : "No fixtures yet."
						}}</span>
						<UButton v-if="!search" variant="link" @click="importOpen = true">
							Import fixtures from a spreadsheet
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
			:title="editing ? 'Edit fixture' : 'Add a fixture'"
			:description="
				editing
					? 'Add the score once the match has been played.'
					: 'Leave the scores empty until the match has been played.'
			"
			:ui="{
				title: 'text-primary font-bold text-xl',
				description: 'text-sm text-muted',
			}"
		>
			<template #body>
				<AdminFixtureForm
					:key="editing?.id ?? 'new'"
					:match="editing"
					:teams="teams"
					:loading="saving"
					@submit="saveMatch"
					@cancel="formOpen = false"
				/>
			</template>
		</UModal>

		<UModal
			v-model:open="importOpen"
			title="Import fixtures"
			description="Add many fixtures at once from a CSV or Excel file."
			:ui="{
				content: 'sm:max-w-5xl',
				title: 'text-primary font-bold text-xl',
				description: 'text-sm text-muted',
			}"
		>
			<template #body>
				<AdminFixtureImport
					:teams="teams"
					:existing="matches"
					@imported="addImported"
					@close="importOpen = false"
				/>
			</template>
		</UModal>

		<UModal
			:open="toDelete.length > 0"
			:title="
				toDelete.length === 1
					? `Delete ${toDelete[0]?.homeName} v ${toDelete[0]?.awayName}?`
					: `Delete ${toDelete.length} fixtures?`
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
					<li v-for="row in toDelete" :key="row.id">
						{{ row.homeName }} v {{ row.awayName }}
						<span v-if="row.start_time" class="text-muted"
							>({{ formatKickoffDay(row.start_time) }})</span
						>
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
					<UButton color="error" :loading="deleting" @click="deleteMatches"
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
	import type { Match } from "~/types/Match";
	import type { Team } from "~/types/Team";

	definePageMeta({
		layout: "admin",
	});

	const adminFetch = useAdminFetch();
	const toast = useToast();

	const matches = ref<Match[]>([]);
	const teams = ref<Team[]>([]);
	const loading = ref(false);
	const loadError = ref("");

	const load = async () => {
		loading.value = true;
		loadError.value = "";
		try {
			[matches.value, teams.value] = await Promise.all([
				adminFetch<Match[]>("/api/admin/matches"),
				adminFetch<Team[]>("/api/admin/teams"),
			]);
			rowSelection.value = {};
		} catch (error) {
			loadError.value = fetchErrorMessage(error);
		} finally {
			loading.value = false;
		}
	};
	onMounted(load);

	/* ---------- table ---------- */

	const STATE = {
		played: { label: "Played", color: "success" },
		upcoming: { label: "Upcoming", color: "info" },
		awaiting: { label: "Needs score", color: "warning" },
	} as const;

	// a fixture with its team names, for showing, searching and sorting
	interface FixtureRow extends Match {
		homeName: string;
		homeCrest: string | null;
		awayName: string;
		awayCrest: string | null;
		state: keyof typeof STATE;
	}

	const rows = computed<FixtureRow[]>(() => {
		const byId = new Map(teams.value.map((team) => [team.id, team]));
		const now = Date.now();
		return matches.value.map((match) => {
			const home = byId.get(match.home_team);
			const away = byId.get(match.away_team);
			return {
				...match,
				homeName: home?.name ?? "Unknown team",
				homeCrest: home?.crest_url ?? null,
				awayName: away?.name ?? "Unknown team",
				awayCrest: away?.crest_url ?? null,
				state:
					match.home_score !== null && match.away_score !== null
						? "played"
						: match.start_time && Date.parse(match.start_time) < now
							? "awaiting"
							: "upcoming",
			};
		});
	});

	const columns: TableColumn<FixtureRow>[] = [
		{ id: "select", enableSorting: false },
		{ accessorKey: "start_time", enableGlobalFilter: false },
		{ accessorKey: "homeName", header: "Home", enableSorting: false },
		{ id: "score", header: "", enableSorting: false },
		{ accessorKey: "awayName", header: "Away", enableSorting: false },
		{ accessorKey: "state", header: "Status", enableGlobalFilter: false },
		{ id: "actions", enableSorting: false },
	];

	const table = useTemplateRef("table");
	const search = ref("");
	// newest first, like the old fixtures page
	const sorting = ref([{ id: "start_time", desc: true }]);
	const pagination = ref({ pageIndex: 0, pageSize: 10 });
	const rowSelection = ref<Record<string, boolean>>({});

	const sortIcon = (sorted: false | "asc" | "desc") =>
		sorted === "asc"
			? "i-heroicons-bars-arrow-up-20-solid"
			: sorted === "desc"
				? "i-heroicons-bars-arrow-down-20-solid"
				: "i-heroicons-arrows-up-down-20-solid";

	const selected = computed(() =>
		rows.value.filter((row) => rowSelection.value[String(row.id)]),
	);

	const filteredCount = computed(
		() =>
			table.value?.tableApi.getFilteredRowModel().rows.length ??
			rows.value.length,
	);
	const rangeLabel = computed(() => {
		const total = filteredCount.value;
		if (!total) return "";
		const first = pagination.value.pageIndex * pagination.value.pageSize + 1;
		const last = Math.min(first + pagination.value.pageSize - 1, total);
		return `Showing ${first}-${last} of ${total} ${total === 1 ? "fixture" : "fixtures"}`;
	});

	// the table only notices a new pagination object, not a changed property
	const goToPage = (page: number) => {
		pagination.value = { ...pagination.value, pageIndex: page - 1 };
	};
	watch(search, () => goToPage(1));

	const rowActions = (row: FixtureRow) => [
		[
			{
				label: row.state === "awaiting" ? "Add score" : "Edit",
				icon: "i-heroicons-pencil-square-20-solid",
				onSelect: () => openForm(row),
			},
			{
				label: "Delete",
				icon: "i-heroicons-trash-20-solid",
				color: "error" as const,
				onSelect: () => {
					toDelete.value = [row];
				},
			},
		],
	];

	/* ---------- add and edit ---------- */

	const formOpen = ref(false);
	const editing = ref<Match | null>(null);
	const saving = ref(false);

	const openForm = (match: Match | null = null) => {
		editing.value = match;
		formOpen.value = true;
	};

	const saveMatch = async (match: MatchInput) => {
		saving.value = true;
		try {
			if (editing.value) {
				const updated = await adminFetch<Match>(
					`/api/admin/matches/${editing.value.id}`,
					{ method: "PATCH", body: match },
				);
				matches.value = matches.value.map((other) =>
					other.id === updated.id ? updated : other,
				);
			} else {
				matches.value = [
					...matches.value,
					await adminFetch<Match>("/api/admin/matches", {
						method: "POST",
						body: match,
					}),
				];
			}
			toast.add({
				title: editing.value ? "Fixture updated" : "Fixture added",
				color: "success",
			});
			formOpen.value = false;
		} catch (error) {
			toast.add({
				title: "Could not save the fixture",
				description: fetchErrorMessage(error),
				color: "error",
			});
		} finally {
			saving.value = false;
		}
	};

	/* ---------- import ---------- */

	const importOpen = ref(false);

	const addImported = (imported: Match[], newTeams: Team[]) => {
		teams.value = [...teams.value, ...newTeams].sort((a, b) =>
			a.name.localeCompare(b.name),
		);
		matches.value = [...matches.value, ...imported];
	};

	/* ---------- delete ---------- */

	const toDelete = ref<FixtureRow[]>([]);
	const deleting = ref(false);

	const deleteMatches = async () => {
		deleting.value = true;
		try {
			const { deleted } = await adminFetch<{ deleted: number[] }>(
				"/api/admin/matches",
				{
					method: "DELETE",
					body: { ids: toDelete.value.map((row) => row.id) },
				},
			);
			matches.value = matches.value.filter(
				(match) => !deleted.includes(match.id),
			);
			rowSelection.value = {};
			toast.add({
				title: `${deleted.length} ${deleted.length === 1 ? "fixture" : "fixtures"} deleted`,
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
