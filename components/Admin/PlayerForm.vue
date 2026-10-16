<template>
	<UForm
		:state="state"
		:schema="playerInputSchema"
		class="flex flex-col gap-4"
		@submit="submit"
	>
		<div class="flex items-center gap-4">
			<UAvatar
				:src="photoPreview ?? undefined"
				:alt="state.full_name"
				icon="i-heroicons-user-20-solid"
				size="3xl"
			/>
			<div class="flex flex-wrap gap-2">
				<UButton
					color="neutral"
					variant="outline"
					icon="i-heroicons-arrow-up-tray-20-solid"
					@click="photoInput?.click()"
				>
					{{ photoPreview ? "Change photo" : "Upload photo" }}
				</UButton>
				<UButton
					v-if="photoPreview"
					color="neutral"
					variant="ghost"
					@click="removePhoto"
					>Remove</UButton
				>
			</div>
			<input
				ref="photoInput"
				type="file"
				:accept="IMAGE_ACCEPT"
				class="hidden"
				@change="choosePhoto"
			/>
		</div>

		<UFormField label="Full name" name="full_name" required>
			<UInput v-model="state.full_name" placeholder="e.g. Chinedu Okafor" />
		</UFormField>

		<div class="grid grid-cols-2 gap-4">
			<UFormField label="Position" name="position" required>
				<USelect
					v-model="state.position"
					:items="positionItems"
					placeholder="Select position"
					class="w-full"
				/>
			</UFormField>
			<UFormField label="Jersey number" name="jersey_number">
				<UInput
					v-model.number="state.jersey_number"
					type="number"
					min="1"
					max="99"
				/>
			</UFormField>
			<UFormField label="Date of birth" name="date_of_birth">
				<UInput v-model="state.date_of_birth" type="date" />
			</UFormField>
			<UFormField label="Nationality" name="nationality">
				<UInput v-model="state.nationality" placeholder="e.g. Nigeria" />
			</UFormField>
			<UFormField label="Preferred foot" name="preferred_foot">
				<USelect
					v-model="state.preferred_foot"
					:items="footItems"
					placeholder="Not set"
					class="w-full"
				/>
			</UFormField>
			<UFormField label="Height (cm)" name="height_cm">
				<UInput
					v-model.number="state.height_cm"
					type="number"
					min="100"
					max="250"
				/>
			</UFormField>
			<UFormField label="Date joined" name="joined_at">
				<UInput v-model="state.joined_at" type="date" />
			</UFormField>
		</div>

		<UFormField label="Bio" name="bio">
			<UTextarea v-model="state.bio" :rows="3" class="w-full" />
		</UFormField>

		<USwitch
			v-model="state.is_active"
			label="Active"
			description="Active players are shown on the public site"
		/>

		<div class="flex justify-end gap-2">
			<UButton
				color="neutral"
				variant="ghost"
				:disabled="loading"
				@click="$emit('cancel')"
				>Cancel</UButton
			>
			<UButton type="submit" :loading="loading" class="px-6"
				>{{ player ? "Save changes" : "Add player" }}
			</UButton>
		</div>
	</UForm>
</template>

<script setup lang="ts">
	import type { FormSubmitEvent } from "@nuxt/ui";
	import type { Player } from "~/types/Player";

	const props = defineProps<{
		// the player being edited; leave out to add a new one
		player?: Player | null;
		loading?: boolean;
	}>();

	const emit = defineEmits<{
		// `photo` is a newly chosen image that still has to be uploaded
		submit: [player: PlayerInput, photo: File | null];
		cancel: [];
	}>();

	// the database stores the code ("CB") and the lowercase foot ("left")
	const positionItems = PLAYER_POSITIONS.map(({ code, label }) => ({
		label: `${code} - ${label}`,
		value: code,
	}));
	const footItems = PREFERRED_FEET.map((foot) => ({
		label: foot[0]!.toUpperCase() + foot.slice(1),
		value: foot,
	}));

	const state = reactive({
		full_name: props.player?.full_name ?? "",
		position: props.player?.position ?? undefined,
		jersey_number: props.player?.jersey_number ?? undefined,
		date_of_birth: props.player?.date_of_birth ?? "",
		nationality: props.player?.nationality ?? "",
		preferred_foot: props.player?.preferred_foot ?? undefined,
		height_cm: props.player?.height_cm ?? undefined,
		joined_at: props.player?.joined_at ?? "",
		bio: props.player?.bio ?? "",
		photo_url: props.player?.photo_url ?? null,
		is_active: props.player?.is_active ?? true,
	});

	const photoInput = ref<HTMLInputElement | null>(null);
	const photoFile = ref<File | null>(null);
	const photoPreview = ref<string | null>(state.photo_url);

	const choosePhoto = (event: Event) => {
		const file = (event.target as HTMLInputElement).files?.[0];
		if (!file) return;
		photoFile.value = file;
		photoPreview.value = URL.createObjectURL(file);
	};

	const removePhoto = () => {
		photoFile.value = null;
		photoPreview.value = null;
		state.photo_url = null;
		if (photoInput.value) photoInput.value.value = "";
	};

	const submit = (event: FormSubmitEvent<PlayerInput>) => {
		emit("submit", event.data, photoFile.value);
	};
</script>
