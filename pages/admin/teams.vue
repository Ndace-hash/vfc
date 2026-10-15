<template>
	<Head>
		<Title>Teams | Valiant FC</Title>
	</Head>
	<section class="px-4">
		<h1 class="text-white capitalize text-2xl max-w-[1100px] mx-auto my-6">
			Teams
		</h1>

		<div class="bg-white max-w-[1100px] mx-auto rounded-[8px] shadow-lg my-10">
			<div
				class="flex flex-wrap items-center gap-2 p-4 justify-between border-b border-admin-light"
			>
				<UButton icon="i-heroicons-plus-20-solid" @click="openForm()"
					>Add team</UButton
				>
				<div class="flex items-center gap-2">
					<UButton
						color="neutral"
						variant="ghost"
						icon="i-heroicons-arrow-path-20-solid"
						:loading="loading"
						@click="loadTeams"
					>
						Refresh
					</UButton>
					<UInput
						v-model="search"
						icon="i-heroicons-magnifying-glass-20-solid"
						placeholder="Search teams..."
						class="w-56"
					/>
				</div>
			</div>

			<UAlert
				v-if="loadError"
				color="error"
				variant="subtle"
				icon="i-heroicons-exclamation-triangle"
				title="Could not load teams"
				:description="loadError"
				class="m-4"
			/>

			<UTable
				v-model:global-filter="search"
				:data="teams"
				:columns="columns"
				:loading="loading"
			>
				<template #name-cell="{ row }">
					<div class="flex items-center gap-3">
						<TeamCrest
							:name="row.original.name"
							:crest-url="row.original.crest_url"
							class="size-9 shrink-0"
						/>
						<span class="font-medium text-highlighted">{{
							row.original.name
						}}</span>
					</div>
				</template>
				<template #created_at-cell="{ row }">
					{{ formatDate(row.original.created_at) }}
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
						<UIcon name="i-heroicons-user-group" class="text-3xl" />
						<span>{{
							search ? "No teams match your search." : "No teams yet."
						}}</span>
						<UButton v-if="!search" variant="link" @click="openForm()">
							Add the first team
						</UButton>
					</div>
				</template>
			</UTable>
		</div>

		<UModal
			v-model:open="formOpen"
			:title="editing ? 'Edit team' : 'Add a new team'"
			:description="
				editing
					? 'Update the team\'s details.'
					: 'Teams can be given a crest later.'
			"
			:ui="{
				title: 'text-primary font-bold text-xl',
				description: 'text-sm text-admin-dark',
			}"
		>
			<template #body>
				<UForm
					:state="state"
					:schema="teamInputSchema"
					class="flex flex-col gap-4"
					@submit="saveTeam"
				>
					<div class="flex items-center gap-4">
						<TeamCrest
							:name="state.name || '?'"
							:crest-url="crestPreview"
							class="size-16 shrink-0"
						/>
						<UFormField label="Team name" name="name" required class="grow">
							<UInput v-model="state.name" placeholder="e.g. Valiant FC" />
						</UFormField>
					</div>
					<UFormField
						label="Short name"
						name="short_name"
						hint="Optional"
						description="Used where space is tight, such as fixtures."
					>
						<UInput v-model="state.short_name" placeholder="e.g. VFC" />
					</UFormField>
					<UFormField
						label="Crest image link"
						name="crest_url"
						hint="Optional"
						description="Leave empty to use the placeholder shield."
					>
						<UInput
							v-model="state.crest_url"
							placeholder="https://example.com/crest.png"
							@blur="crestPreview = state.crest_url"
						/>
					</UFormField>
					<div class="flex justify-end gap-2">
						<UButton
							color="neutral"
							variant="ghost"
							:disabled="saving"
							@click="formOpen = false"
							>Cancel</UButton
						>
						<UButton type="submit" :loading="saving" class="px-6">{{
							editing ? "Save changes" : "Add team"
						}}</UButton>
					</div>
				</UForm>
			</template>
		</UModal>

		<UModal
			:open="!!toDelete"
			:title="`Delete ${toDelete?.name}?`"
			description="This cannot be undone."
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
					<UButton color="error" :loading="deleting" @click="deleteTeam"
						>Delete</UButton
					>
				</div>
			</template>
		</UModal>
	</section>
</template>

<script setup lang="ts">
	import type { FormSubmitEvent, TableColumn } from "@nuxt/ui";
	import type { Team } from "~/types/Team";

	definePageMeta({
		layout: "admin",
	});

	const adminFetch = useAdminFetch();
	const toast = useToast();

	const teams = ref<Team[]>([]);
	const loading = ref(false);
	const loadError = ref("");
	const search = ref("");

	const loadTeams = async () => {
		loading.value = true;
		loadError.value = "";
		try {
			teams.value = await adminFetch<Team[]>("/api/admin/teams");
		} catch (error) {
			loadError.value = fetchErrorMessage(error);
		} finally {
			loading.value = false;
		}
	};
	onMounted(loadTeams);

	const columns: TableColumn<Team>[] = [
		{ accessorKey: "name", header: "Team" },
		{ accessorKey: "created_at", header: "Added", enableGlobalFilter: false },
		{ id: "actions" },
	];

	const formatDate = (date: string) =>
		new Date(date).toLocaleDateString("en-GB", {
			day: "numeric",
			month: "short",
			year: "numeric",
		});

	const byName = (a: Team, b: Team) => a.name.localeCompare(b.name);

	const rowActions = (team: Team) => [
		[
			{
				label: "Edit",
				icon: "i-heroicons-pencil-square-20-solid",
				onSelect: () => openForm(team),
			},
			{
				label: "Delete",
				icon: "i-heroicons-trash-20-solid",
				color: "error" as const,
				onSelect: () => {
					toDelete.value = team;
				},
			},
		],
	];

	/* ---------- add and edit ---------- */

	const formOpen = ref(false);
	const editing = ref<Team | null>(null);
	const saving = ref(false);
	const state = reactive({ name: "", crest_url: "", short_name: "" });
	// the crest shown in the form; follows the link once typing is finished
	// so half-typed links are not requested on every keystroke
	const crestPreview = ref("");

	const openForm = (team: Team | null = null) => {
		editing.value = team;
		state.name = team?.name ?? "";
		state.crest_url = team?.crest_url ?? "";
		state.short_name = team?.short_name ?? "";
		crestPreview.value = state.crest_url;
		formOpen.value = true;
	};

	const saveTeam = async (event: FormSubmitEvent<TeamInput>) => {
		saving.value = true;
		try {
			if (editing.value) {
				const updated = await adminFetch<Team>(
					`/api/admin/teams/${editing.value.id}`,
					{ method: "PATCH", body: event.data },
				);
				teams.value = teams.value
					.map((team) => (team.id === updated.id ? updated : team))
					.sort(byName);
			} else {
				const created = await adminFetch<Team>("/api/admin/teams", {
					method: "POST",
					body: event.data,
				});
				teams.value = [...teams.value, created].sort(byName);
			}
			toast.add({
				title: editing.value ? "Team updated" : "Team added",
				description: event.data.name,
				color: "success",
			});
			formOpen.value = false;
		} catch (error) {
			toast.add({
				title: "Could not save the team",
				description: fetchErrorMessage(error),
				color: "error",
			});
		} finally {
			saving.value = false;
		}
	};

	/* ---------- delete ---------- */

	const toDelete = ref<Team | null>(null);
	const deleting = ref(false);

	const deleteTeam = async () => {
		if (!toDelete.value) return;
		deleting.value = true;
		try {
			const { deleted } = await adminFetch<{ deleted: string }>(
				`/api/admin/teams/${toDelete.value.id}`,
				{ method: "DELETE" },
			);
			teams.value = teams.value.filter((team) => team.id !== deleted);
			toast.add({
				title: "Team deleted",
				description: toDelete.value.name,
				color: "success",
			});
			toDelete.value = null;
		} catch (error) {
			toast.add({
				title: "Could not delete the team",
				description: fetchErrorMessage(error),
				color: "error",
			});
		} finally {
			deleting.value = false;
		}
	};
</script>
