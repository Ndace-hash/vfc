<template>
	<UForm
		:state="state"
		:validate="validate"
		class="flex flex-col gap-4"
		@submit="submit"
	>
		<div class="grid grid-cols-2 gap-4">
			<UFormField label="Home team" name="home_team" required>
				<USelectMenu
					v-model="state.home_team"
					:items="teamItems"
					value-key="value"
					placeholder="Choose a team"
					class="w-full"
				/>
			</UFormField>
			<UFormField label="Away team" name="away_team" required>
				<USelectMenu
					v-model="state.away_team"
					:items="teamItems"
					value-key="value"
					placeholder="Choose a team"
					class="w-full"
				/>
			</UFormField>
			<UFormField label="Date" name="date" required>
				<UInput v-model="state.date" type="date" />
			</UFormField>
			<UFormField label="Kick-off" name="time" required hint="Nigerian time">
				<UInput v-model="state.time" type="time" />
			</UFormField>
			<UFormField label="Home score" name="home_score" hint="After the match">
				<UInput v-model.number="state.home_score" type="number" min="0" />
			</UFormField>
			<UFormField label="Away score" name="away_score" hint="After the match">
				<UInput v-model.number="state.away_score" type="number" min="0" />
			</UFormField>
		</div>

		<div class="flex justify-end gap-2">
			<UButton
				color="neutral"
				variant="ghost"
				:disabled="loading"
				@click="$emit('cancel')"
				>Cancel</UButton
			>
			<UButton type="submit" :loading="loading" class="px-6">{{
				match ? "Save changes" : "Add fixture"
			}}</UButton>
		</div>
	</UForm>
</template>

<script setup lang="ts">
	import type { FormError } from "@nuxt/ui";
	import type { Match } from "~/types/Match";
	import type { Team } from "~/types/Team";

	const props = defineProps<{
		// the fixture being edited; leave out to add a new one
		match?: Match | null;
		teams: Team[];
		loading?: boolean;
	}>();

	const emit = defineEmits<{
		submit: [match: MatchInput];
		cancel: [];
	}>();

	const teamItems = computed(() =>
		props.teams.map((team) => ({ label: team.name, value: team.id })),
	);

	const kickoff = props.match?.start_time
		? kickoffParts(props.match.start_time)
		: { date: "", time: "" };

	const state = reactive({
		home_team: props.match?.home_team,
		away_team: props.match?.away_team,
		date: kickoff.date,
		time: kickoff.time,
		home_score: props.match?.home_score ?? undefined,
		away_score: props.match?.away_score ?? undefined,
	});

	// the form keeps date and time apart; the database stores one kick-off
	const toInput = () => ({
		home_team: state.home_team,
		away_team: state.away_team,
		start_time:
			state.date && state.time ? toKickoff(state.date, state.time) : "",
		home_score: state.home_score,
		away_score: state.away_score,
	});

	const validate = (): FormError[] => {
		const result = matchInputSchema.safeParse(toInput());
		if (result.success) return [];
		return result.error.issues.map((issue) => ({
			// a missing kick-off is reported on whichever of the two inputs is empty
			name:
				issue.path[0] === "start_time"
					? state.date
						? "time"
						: "date"
					: String(issue.path[0]),
			message: issue.message,
		}));
	};

	const submit = () => {
		emit("submit", matchInputSchema.parse(toInput()));
	};
</script>
