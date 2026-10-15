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
					<strong>Date</strong>, <strong>Kick-off</strong>,
					<strong>Home Team</strong> and <strong>Away Team</strong> are
					required. Add <strong>Home Score</strong> and
					<strong>Away Score</strong> (or one <strong>Score</strong> column like
					2-1) for matches already played.
				</p>
				<p>
					Write team names as they appear on the Teams page. Names that do not
					match can be linked to a team, or added as new teams, in the next
					step. Kick-off times are Nigerian time.
				</p>
				<p>
					Start from a template:
					<a
						href="/templates/fixtures-template.csv"
						download
						class="text-primary underline"
						>CSV</a
					>
					or
					<a
						href="/templates/fixtures-template.xlsx"
						download
						class="text-primary underline"
						>Excel</a
					>. Remove the example row before importing.
				</p>
			</div>
		</template>

		<!-- 2. link team names, then check the rows before anything is saved -->
		<template v-else-if="step === 'preview'">
			<div class="flex flex-wrap items-center gap-2">
				<span class="font-semibold truncate max-w-64">{{ file?.name }}</span>
				<UBadge color="success" variant="subtle"
					>{{ ready.length }} ready to import</UBadge
				>
				<UBadge v-if="countOf('unresolved')" color="warning" variant="subtle">
					{{ countOf("unresolved") }} waiting for a team choice
				</UBadge>
				<UBadge v-if="countOf('duplicate')" color="neutral" variant="subtle">
					{{ countOf("duplicate") }} already added, will be skipped
				</UBadge>
				<UBadge v-if="countOf('invalid')" color="error" variant="subtle">
					{{ countOf("invalid") }} with problems, will not be imported
				</UBadge>
			</div>

			<div
				v-if="unknownNames.length"
				class="border border-default rounded-md p-4 flex flex-col gap-3"
			>
				<div>
					<h3 class="font-semibold">
						{{ unknownNames.length }}
						{{ unknownNames.length === 1 ? "team name is" : "team names are" }}
						not on the Teams page
					</h3>
					<p class="text-sm text-muted">
						Choose the team each one means, or add it as a new team. New teams
						are only created after you confirm.
					</p>
				</div>
				<div
					v-for="unknown in unknownNames"
					:key="unknown.key"
					class="flex flex-wrap items-center gap-3"
				>
					<div class="w-56">
						<p class="font-medium truncate">{{ unknown.name }}</p>
						<p class="text-xs text-muted">
							used in {{ unknown.rows }}
							{{ unknown.rows === 1 ? "row" : "rows" }}
						</p>
					</div>
					<USelectMenu
						v-model="choices[unknown.key]"
						:items="choiceItems(unknown.name)"
						value-key="value"
						placeholder="Choose what this is"
						class="w-80"
					/>
				</div>
			</div>

			<UAlert
				v-if="ignoredColumns.length"
				color="neutral"
				variant="subtle"
				icon="i-heroicons-information-circle"
				:title="`Ignored columns: ${ignoredColumns.join(', ')}`"
				description="These headers do not match a fixture field."
			/>

			<UTable
				:data="rows"
				:columns="columns"
				sticky
				class="max-h-[45vh] border border-default rounded-md"
			>
				<template #status-cell="{ row }">
					<UBadge :color="STATUS[row.original.status].color" variant="subtle">
						{{ STATUS[row.original.status].label }}
					</UBadge>
				</template>
				<template #kickoff-cell="{ row }">
					<template v-if="row.original.start_time">
						{{ formatKickoffDay(row.original.start_time) }}
						<span class="text-muted ms-1">{{ row.original.time }}</span>
					</template>
					<template v-else
						>{{ row.original.date }} {{ row.original.time }}</template
					>
				</template>
				<template #fixture-cell="{ row }">
					<div class="whitespace-normal min-w-56 max-w-96">
						<p class="font-medium text-highlighted">
							{{ row.original.home || "?" }} v {{ row.original.away || "?" }}
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
				<template #score-cell="{ row }">
					<template v-if="row.original.home_score !== null">
						{{ row.original.home_score }} - {{ row.original.away_score }}
					</template>
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
					@click="startImport"
				>
					Import {{ ready.length }}
					{{ ready.length === 1 ? "fixture" : "fixtures" }}
				</UButton>
			</div>
		</template>

		<!-- 3. what happened -->
		<template v-else-if="result">
			<UAlert
				:color="result.inserted.length ? 'success' : 'neutral'"
				variant="subtle"
				icon="i-heroicons-check-circle"
				:title="`${result.inserted.length} ${result.inserted.length === 1 ? 'fixture' : 'fixtures'} imported`"
				:description="
					createdTeams.length
						? `New teams added: ${createdTeams.map((team) => team.name).join(', ')}`
						: undefined
				"
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
						<span class="font-medium w-64 shrink-0 truncate">{{
							item.fixture
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

		<!-- permission before any team is created -->
		<UModal
			v-model:open="confirmOpen"
			:title="`Add ${teamsToCreate.length} new ${teamsToCreate.length === 1 ? 'team' : 'teams'}?`"
			description="These teams will be added to the Teams page, then the fixtures are imported. You can add crests and short names later."
		>
			<template #body>
				<ul class="text-sm mb-4 list-disc ps-5">
					<li v-for="team in teamsToCreate" :key="team.key">{{ team.name }}</li>
				</ul>
				<div class="flex justify-end gap-2">
					<UButton color="neutral" variant="ghost" @click="confirmOpen = false"
						>Cancel</UButton
					>
					<UButton @click="confirmAndImport"
						>Add {{ teamsToCreate.length === 1 ? "team" : "teams" }} and
						import</UButton
					>
				</div>
			</template>
		</UModal>
	</div>
</template>

<script setup lang="ts">
	import type { TableColumn } from "@nuxt/ui";
	import type { Match } from "~/types/Match";
	import type { Team } from "~/types/Team";

	const props = defineProps<{
		teams: Team[];
		// fixtures already in the database, used to flag duplicates
		existing: Match[];
	}>();

	const emit = defineEmits<{
		imported: [matches: Match[], teams: Team[]];
		close: [];
	}>();

	// choice value for "add this name as a new team"
	const CREATE = "create";

	type Status = "ready" | "unresolved" | "duplicate" | "invalid";
	interface PreviewRow extends SheetFixtureRow {
		status: Status;
		note: string;
		// set when both teams are known (a new team gets a temporary key)
		home_team: string | null;
		away_team: string | null;
	}
	interface RowReport {
		row: number;
		reason: string;
	}
	interface ImportResult {
		inserted: Match[];
		skipped: RowReport[];
		failed: RowReport[];
	}

	const STATUS = {
		ready: { label: "Ready", color: "success" },
		unresolved: { label: "Choose team", color: "warning" },
		duplicate: { label: "Skip", color: "neutral" },
		invalid: { label: "Problem", color: "error" },
	} as const;

	const columns: TableColumn<PreviewRow>[] = [
		{ accessorKey: "row", header: "Row" },
		{ id: "status", header: "Status" },
		{ id: "kickoff", header: "Kick-off" },
		{ id: "fixture", header: "Fixture" },
		{ id: "score", header: "Score" },
	];

	const adminFetch = useAdminFetch();

	const step = ref<"choose" | "preview" | "done">("choose");
	const file = ref<File | null>(null);
	const problem = ref("");
	const sheetRows = ref<SheetFixtureRow[]>([]);
	const ignoredColumns = ref<string[]>([]);
	// what each unknown team name means: a team id, or CREATE
	const choices = reactive<Record<string, string | undefined>>({});
	const importing = ref(false);
	const confirmOpen = ref(false);
	const result = ref<ImportResult | null>(null);
	const createdTeams = ref<Team[]>([]);
	// the preview as it was when importing; the live one changes once the
	// imported fixtures and new teams reach the page
	const importedPreview = ref<PreviewRow[]>([]);

	/* ---------- team names ---------- */

	// names the Teams page does not know, once each, with how often they are used
	const unknownNames = computed(() => {
		const unknown = new Map<
			string,
			{ key: string; name: string; rows: number }
		>();
		for (const row of sheetRows.value) {
			if (row.errors.length) continue;
			for (const name of [row.home, row.away]) {
				if (findTeamByName(props.teams, name)) continue;
				const key = teamNameKey(name);
				const entry = unknown.get(key) ?? { key, name, rows: 0 };
				entry.rows += 1;
				unknown.set(key, entry);
			}
		}
		return [...unknown.values()];
	});

	const choiceItems = (name: string) => [
		{
			label: `Add "${name}" as a new team`,
			value: CREATE,
			icon: "i-heroicons-plus-20-solid",
		},
		...props.teams.map((team) => ({ label: team.name, value: team.id })),
	];

	// a team id, "new:<name>" for a team still to be created, or null if undecided
	const teamFor = (name: string) => {
		const known = findTeamByName(props.teams, name);
		if (known) return known.id;
		const choice = choices[teamNameKey(name)];
		if (choice === CREATE) return `new:${teamNameKey(name)}`;
		return choice ?? null;
	};

	/* ---------- preview ---------- */

	const rows = computed(() => {
		const accepted: Pick<
			MatchInput,
			"home_team" | "away_team" | "start_time"
		>[] = [];
		return sheetRows.value.map((row): PreviewRow => {
			const home_team = teamFor(row.home);
			const away_team = teamFor(row.away);
			const preview = (status: Status, note = ""): PreviewRow => ({
				...row,
				home_team,
				away_team,
				status,
				note,
			});
			if (row.errors.length) return preview("invalid", row.errors.join(". "));
			if (!home_team || !away_team) {
				const missing = [!home_team && row.home, !away_team && row.away]
					.filter(Boolean)
					.join(" and ");
				return preview("unresolved", `Choose what "${missing}" is above`);
			}
			if (home_team === away_team) {
				return preview("invalid", "Home and away are the same team");
			}
			const fixture = { home_team, away_team, start_time: row.start_time! };
			const existingMatch = props.existing.some(
				(match) =>
					match.start_time &&
					isSameFixture({ ...match, start_time: match.start_time }, fixture),
			);
			if (existingMatch) return preview("duplicate", "Already in the database");
			if (accepted.some((other) => isSameFixture(other, fixture))) {
				return preview("duplicate", "Appears more than once in the file");
			}
			accepted.push(fixture);
			return preview("ready");
		});
	});

	const ready = computed(() =>
		rows.value.filter((row) => row.status === "ready"),
	);
	const countOf = (status: Status) =>
		rows.value.filter((row) => row.status === status).length;

	// new teams that importable rows actually need
	const teamsToCreate = computed(() =>
		unknownNames.value.filter(
			(unknown) =>
				choices[unknown.key] === CREATE &&
				ready.value.some(
					(row) =>
						teamNameKey(row.home) === unknown.key ||
						teamNameKey(row.away) === unknown.key,
				),
		),
	);

	const readFile = async (chosen: File) => {
		problem.value = "";
		try {
			const sheet = parseFixtureSheet(await readSheetFile(chosen));
			if (sheet.missing.length) {
				throw new Error(
					`The file has no ${sheet.missing.join(" or ")} column. Check the header row.`,
				);
			}
			if (!sheet.fixtures.length)
				throw new Error("The file has no fixture rows.");
			sheetRows.value = sheet.fixtures;
			ignoredColumns.value = sheet.ignored;
			for (const key of Object.keys(choices)) delete choices[key];
			step.value = "preview";
		} catch (error) {
			problem.value = (error as Error).message || "Could not read the file";
			file.value = null;
		}
	};

	watch(file, (chosen) => {
		if (chosen) readFile(chosen);
	});

	/* ---------- import ---------- */

	const startImport = () => {
		if (teamsToCreate.value.length) confirmOpen.value = true;
		else runImport();
	};

	const confirmAndImport = () => {
		confirmOpen.value = false;
		runImport();
	};

	const runImport = async () => {
		importing.value = true;
		problem.value = "";
		const created: Team[] = [];
		importedPreview.value = rows.value;
		try {
			// only reached after the admin agreed to add these teams
			for (const unknown of teamsToCreate.value) {
				created.push(
					await adminFetch<Team>("/api/admin/teams", {
						method: "POST",
						body: { name: unknown.name, crest_url: null, short_name: null },
					}),
				);
			}
			const newTeamId = (id: string) =>
				id.startsWith("new:")
					? created.find((team) => teamNameKey(team.name) === id.slice(4))!.id
					: id;

			result.value = await adminFetch<ImportResult>(
				"/api/admin/matches/import",
				{
					method: "POST",
					body: {
						matches: ready.value.map((row) => ({
							row: row.row,
							home_team: newTeamId(row.home_team!),
							away_team: newTeamId(row.away_team!),
							start_time: row.start_time,
							home_score: row.home_score,
							away_score: row.away_score,
						})),
					},
				},
			);
			createdTeams.value = created;
			emit("imported", result.value.inserted, created);
			step.value = "done";
		} catch (error) {
			problem.value = fetchErrorMessage(error);
			if (created.length) {
				problem.value += `. These new teams were already added: ${created.map((team) => team.name).join(", ")}`;
				emit("imported", [], created);
			}
		} finally {
			importing.value = false;
		}
	};

	// rows left out, combining what the preview caught with what the server reported
	const outcomeGroups = computed(() => {
		if (!result.value) return [];
		const preview = importedPreview.value;
		const fixtureAt = (row: number) => {
			const found = preview.find((item) => item.row === row);
			return found ? `${found.home} v ${found.away}` : "";
		};
		const report = (row: PreviewRow) => ({
			row: row.row,
			fixture: `${row.home || "?"} v ${row.away || "?"}`,
			reason: row.note,
		});
		const fromServer = (item: RowReport) => ({
			...item,
			fixture: fixtureAt(item.row),
		});
		const skipped = [
			...preview.filter((row) => row.status === "duplicate").map(report),
			...result.value.skipped.map(fromServer),
		];
		const failed = [
			...preview
				.filter(
					(row) => row.status === "invalid" || row.status === "unresolved",
				)
				.map(report),
			...result.value.failed.map(fromServer),
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
		sheetRows.value = [];
		ignoredColumns.value = [];
		for (const key of Object.keys(choices)) delete choices[key];
		result.value = null;
		createdTeams.value = [];
		importedPreview.value = [];
		problem.value = "";
	};
</script>
