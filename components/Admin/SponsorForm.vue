<template>
	<UForm
		:state="state"
		:schema="sponsorInputSchema"
		class="flex flex-col gap-4"
		@submit="submit"
	>
		<div class="flex flex-wrap items-center gap-4">
			<!-- logos are usually wide, so the preview is a wide box -->
			<div
				class="grid h-20 w-40 shrink-0 place-items-center overflow-hidden rounded-lg bg-default ring-1 ring-default"
			>
				<img
					v-if="logoPreview"
					:src="logoPreview"
					:alt="`${state.name || 'Sponsor'} logo`"
					class="max-h-full max-w-full object-contain p-2"
				/>
				<UIcon v-else name="i-bi-image" class="size-7 text-dimmed" />
			</div>
			<div class="flex flex-wrap gap-2">
				<UButton
					color="neutral"
					variant="outline"
					icon="i-heroicons-arrow-up-tray-20-solid"
					@click="logoInput?.click()"
				>
					{{ logoPreview ? "Change logo" : "Upload logo" }}
				</UButton>
				<UButton
					v-if="logoPreview"
					color="neutral"
					variant="ghost"
					@click="removeLogo"
					>Remove</UButton
				>
			</div>
			<input
				ref="logoInput"
				type="file"
				:accept="IMAGE_ACCEPT"
				class="hidden"
				@change="chooseLogo"
			/>
		</div>
		<p class="-mt-2 text-xs text-muted">
			PNG with a transparent background works best. JPEG, PNG or WebP, up to
			5 MB.
		</p>

		<UFormField label="Sponsor name" name="name" required>
			<UInput v-model="state.name" placeholder="e.g. Island Casino" />
		</UFormField>

		<div class="grid grid-cols-2 gap-4">
			<UFormField label="Tier" name="tier" required>
				<USelect v-model="state.tier" :items="tierItems" class="w-full" />
			</UFormField>
			<UFormField
				label="Order"
				name="display_order"
				description="Lower numbers come first."
			>
				<UInput
					v-model.number="state.display_order"
					type="number"
					min="0"
					max="999"
				/>
			</UFormField>
		</div>

		<UFormField
			label="Website"
			name="website_url"
			hint="Optional"
			description="Where the logo links to."
		>
			<UInput
				v-model="state.website_url"
				type="url"
				placeholder="https://example.com"
			/>
		</UFormField>

		<USwitch
			v-model="state.is_active"
			label="Show on the website"
			description="Turn off to hide this sponsor without deleting it."
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
				>{{ sponsor ? "Save changes" : "Add sponsor" }}
			</UButton>
		</div>
	</UForm>
</template>

<script setup lang="ts">
	import type { FormSubmitEvent } from "@nuxt/ui";
	import type { Sponsor } from "~/types/Sponsor";

	const props = defineProps<{
		// the sponsor being edited; leave out to add a new one
		sponsor?: Sponsor | null;
		loading?: boolean;
	}>();

	const emit = defineEmits<{
		// `logo` is a newly chosen image that still has to be uploaded
		submit: [sponsor: SponsorInput, logo: File | null];
		cancel: [];
	}>();

	const tierItems = SPONSOR_TIERS.map(({ value, label }) => ({ value, label }));

	const state = reactive({
		name: props.sponsor?.name ?? "",
		tier: props.sponsor?.tier ?? ("partner" as SponsorTier),
		website_url: props.sponsor?.website_url ?? "",
		logo_url: props.sponsor?.logo_url ?? null,
		display_order: props.sponsor?.display_order ?? 0,
		is_active: props.sponsor?.is_active ?? true,
	});

	const logoInput = ref<HTMLInputElement | null>(null);
	const logoFile = ref<File | null>(null);
	const logoPreview = ref<string | null>(state.logo_url);

	const chooseLogo = (event: Event) => {
		const file = (event.target as HTMLInputElement).files?.[0];
		if (!file) return;
		logoFile.value = file;
		logoPreview.value = URL.createObjectURL(file);
	};

	const removeLogo = () => {
		logoFile.value = null;
		logoPreview.value = null;
		state.logo_url = null;
		if (logoInput.value) logoInput.value.value = "";
	};

	const submit = (event: FormSubmitEvent<SponsorInput>) => {
		emit("submit", event.data, logoFile.value);
	};
</script>
