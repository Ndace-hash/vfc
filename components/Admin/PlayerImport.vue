<template>
	<div class="flex flex-col gap-4">
		<!-- 1. choose a file -->
		<template v-if="step === 'choose'">
			<UFileUpload
				v-model="file"
				:accept="SHEET_FILE_TYPES"
				icon="i-heroicons-document-arrow-up"
				label="Drop a CSV or Excel file here"
				description="or click to browse (.csv or .xlsx)"
				class="min-h-44"
			/>

			<UAlert
				v-if="problem"
				color="error"
				variant="subtle"
				icon="i-heroicons-exclamation-triangle"
				:title="problem"
			/>

			<div class="text-sm text-muted flex flex-col gap-1">
				<p>
					The first row must hold the column names.
					<strong>Full Name</strong> and <strong>Position</strong> are required;
					Jersey Number, Date of Birth, Nationality, Preferred Foot, Height
					(cm), Date Joined, Active, Bio and Photo URL are optional.
				</p>
				<p>
					Position must be one of these codes:
					{{ PLAYER_POSITION_CODES.join(", ") }}.
				</p>
				<p>
					Start from a template:
					<a
						href="/templates/players-template.csv"
						download
						class="text-primary underline"
						>CSV</a
					>
					or
					<a
						href="/templates/players-template.xlsx"
						download
						class="text-primary underline"
						>Excel</a
					>. Remove the example row before importing.
				</p>
			</div>
		</template>

		<!-- 2. check the rows before anything is saved -->
		<template v-else-if="step === 'preview'">
			<div class="flex flex-wrap items-center gap-2">
				<span class="font-semibold truncate max-w-64">{{ file?.name }}</span>
				<UBadge color="success" variant="subtle"
					>{{ ready.length }} ready to import</UBadge
				>
				<UBadge v-if="duplicates.length" color="warning" variant="subtle">
					{{ duplicates.length }} already added, will be skipped
				</UBadge>
				<UBadge v-if="invalid.length" color="error" variant="subtle">
					{{ invalid.length }} with problems, will not be imported
				</UBadge>
			</div>

			<UAlert
				v-if="ignoredColumns.length"
				color="neutral"
				variant="subtle"
				icon="i-heroicons-information-circle"
				:title="`Ignored columns: ${ignoredColumns.join(', ')}`"
				description="These headers do not match a player field."
			/>

			<UTable
				:data="rows"
				:columns="columns"
				sticky
				class="max-h-[50vh] border border-default rounded-md"
			>
				<template #status-cell="{ row }">
					<UBadge :color="STATUS[row.original.status].color" variant="subtle">
						{{ STATUS[row.original.status].label }}
					</UBadge>
				</template>
				<template #full_name-cell="{ row }">
					<div class="whitespace-normal min-w-48 max-w-96">
						<p class="font-medium text-highlighted">
							{{ row.original.values.full_name }}
						</p>
						<p
							v-if="row.original.note"
							class="text-xs"
							:class="
								row.original.status === 'invalid'
									? 'text-error'
									: 'text-warning'
							"
						>
							{{ row.original.note }}
						</p>
					</div>
				</template>
			</UTable>

			<UAlert
				v-if="problem"
				color="error"
				variant="subtle"
				icon="i-heroicons-exclamation-triangle"
				:title="problem"
			/>

			<div class="flex justify-between gap-2">
				<UButton
					color="neutral"
					variant="outline"
					:disabled="importing"
					@click="reset"
				>
					Choose another file
				</UButton>
				<UButton
					:loading="importing"
					:disabled="!ready.length"
					icon="i-heroicons-arrow-down-tray-20-solid"
					@click="runImport"
				>
					Import {{ ready.length }}
					{{ ready.length === 1 ? "player" : "players" }}
				</UButton>
			</div>
		</template>

		<!-- 3. what happened -->
		<template v-else-if="result">
			<UAlert
				:color="result.inserted.length ? 'success' : 'neutral'"
				variant="subtle"
				icon="i-heroicons-check-circle"
				:title="`${result.inserted.length} ${result.inserted.length === 1 ? 'player' : 'players'} imported`"
			/>

			<div v-for="group in outcomeGroups" :key="group.title">
				<h3 class="font-semibold mb-1">{{ group.title }}</h3>
				<ul
					class="text-sm max-h-40 overflow-y-auto border border-default rounded-md divide-y divide-default"
				>
					<li
						v-for="item in group.items"
						:key="item.row"
						class="px-3 py-1.5 flex gap-3"
					>
						<span class="text-muted w-16 shrink-0">Row {{ item.row }}</span>
						<span class="font-medium w-48 shrink-0 truncate">{{
							item.full_name
						}}</span>
						<span :class="group.class">{{ item.reason }}</span>
					</li>
				</ul>
			</div>

			<div class="flex justify-between gap-2">
				<UButton color="neutral" variant="outline" @click="reset"
					>Import another file</UButton
				>
				<UButton @click="$emit('close')">Done</UButton>
			</div>
		</template>
	</div>
</template>

<script setup lang="ts">
	import type { TableColumn } from "@nuxt/ui";
	import type { Player } from "~/types/Player";

	const props = defineProps<{
		// players already in the database, used to flag duplicates in the preview
		existing: Player[];
	}>();

	const emit = defineEmits<{
		imported: [players: Player[]];
		close: [];
	}>();

	type Status = "ready" | "duplicate" | "invalid";
	interface PreviewRow extends SheetPlayerRow {
		status: Status;
		note: string;
	}
	interface RowReport {
		row: number;
		full_name: string;
		reason: string;
	}
	interface ImportResult {
		inserted: Player[];
		skipped: RowReport[];
		failed: RowReport[];
	}

	const STATUS = {
		ready: { label: "Ready", color: "success" },
		duplicate: { label: "Skip", color: "warning" },
		invalid: { label: "Problem", color: "error" },
	} as const;

	const adminFetch = useAdminFetch();

	const step = ref<"choose" | "preview" | "done">("choose");
	const file = ref<File | null>(null);
	const problem = ref("");
	const rows = ref<PreviewRow[]>([]);
	const ignoredColumns = ref<string[]>([]);
	const importing = ref(false);
	const result = ref<ImportResult | null>(null);

	const ready = computed(() =>
		rows.value.filter((row) => row.status === "ready"),
	);
	const duplicates = computed(() =>
		rows.value.filter((row) => row.status === "duplicate"),
	);
	const invalid = computed(() =>
		rows.value.filter((row) => row.status === "invalid"),
	);

	// dates are shown spelled out so a swapped day and month is easy to spot
	const value = (field: PlayerField) => (row: PreviewRow) => {
		const cell = row.values[field];
		if (typeof cell === "boolean") return cell ? "Yes" : "No";
		if (typeof cell === "string" && /^\d{4}-\d{2}-\d{2}$/.test(cell)) {
			return new Date(`${cell}T00:00:00`).toLocaleDateString("en-GB", {
				day: "numeric",
				month: "short",
				year: "numeric",
			});
		}
		return cell ?? "";
	};

	const columns: TableColumn<PreviewRow>[] = [
		{ accessorKey: "row", header: "Row" },
		{ id: "status", header: "Status" },
		{ id: "full_name", header: "Full Name" },
		{ id: "position", header: "Position", accessorFn: value("position") },
		{
			id: "jersey_number",
			header: "Jersey",
			accessorFn: value("jersey_number"),
		},
		{
			id: "date_of_birth",
			header: "Date of Birth",
			accessorFn: value("date_of_birth"),
		},
		{
			id: "nationality",
			header: "Nationality",
			accessorFn: value("nationality"),
		},
		{
			id: "preferred_foot",
			header: "Foot",
			accessorFn: value("preferred_foot"),
			meta: { class: { td: "capitalize" } },
		},
		{ id: "height_cm", header: "Height", accessorFn: value("height_cm") },
		{ id: "is_active", header: "Active", accessorFn: value("is_active") },
	];

	const readFile = async (chosen: File) => {
		problem.value = "";
		try {
			const sheet = parsePlayerSheet(await readSheetFile(chosen));
			if (sheet.missing.length) {
				throw new Error(
					`The file has no ${sheet.missing.join(" or ")} column. Check the header row.`,
				);
			}
			if (!sheet.players.length)
				throw new Error("The file has no player rows.");

			const accepted: PlayerInput[] = [];
			rows.value = sheet.players.map((row): PreviewRow => {
				if (!row.player)
					return { ...row, status: "invalid", note: row.errors.join(". ") };
				const player = row.player;
				if (props.existing.some((other) => isSamePlayer(other, player))) {
					return {
						...row,
						status: "duplicate",
						note: "Already in the database",
					};
				}
				if (accepted.some((other) => isSamePlayer(other, player))) {
					return {
						...row,
						status: "duplicate",
						note: "Appears more than once in the file",
					};
				}
				accepted.push(player);
				return { ...row, status: "ready", note: "" };
			});
			ignoredColumns.value = sheet.ignored;
			step.value = "preview";
		} catch (error) {
			problem.value = (error as Error).message || "Could not read the file";
			file.value = null;
		}
	};

	watch(file, (chosen) => {
		if (chosen) readFile(chosen);
	});

	const runImport = async () => {
		importing.value = true;
		problem.value = "";
		try {
			result.value = await adminFetch<ImportResult>(
				"/api/admin/players/import",
				{
					method: "POST",
					body: {
						players: ready.value.map((row) => ({
							row: row.row,
							...row.player,
						})),
					},
				},
			);
			if (result.value.inserted.length) emit("imported", result.value.inserted);
			step.value = "done";
		} catch (error) {
			problem.value = fetchErrorMessage(error);
		} finally {
			importing.value = false;
		}
	};

	// rows left out, combining what the preview caught with what the server reported
	const outcomeGroups = computed(() => {
		if (!result.value) return [];
		const skipped = [
			...duplicates.value.map((row) => ({
				row: row.row,
				full_name: String(row.values.full_name),
				reason: row.note,
			})),
			...result.value.skipped,
		];
		const failed = [
			...invalid.value.map((row) => ({
				row: row.row,
				full_name: String(row.values.full_name),
				reason: row.note,
			})),
			...result.value.failed,
		];
		return [
			{
				title: `Skipped (${skipped.length})`,
				items: skipped,
				class: "text-muted",
			},
			{
				title: `Not imported (${failed.length})`,
				items: failed,
				class: "text-error",
			},
		].filter((group) => group.items.length);
	});

	const reset = () => {
		step.value = "choose";
		file.value = null;
		rows.value = [];
		ignoredColumns.value = [];
		result.value = null;
		problem.value = "";
	};
</script>
