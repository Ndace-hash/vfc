<template>
	<div v-if="sent" class="flex flex-col items-center gap-3 py-6 text-center">
		<UIcon name="i-bi-check-circle-fill" class="size-12 text-primary" />
		<p class="text-lg font-semibold text-highlighted">Thanks, {{ sentTo }}</p>
		<p class="max-w-sm text-toned">
			Your enquiry has reached the club. We’ll get back to you by email.
		</p>
		<UButton class="mt-2 px-6" @click="$emit('done')">Done</UButton>
	</div>

	<UForm
		v-else
		:state="state"
		:schema="sponsorEnquirySchema"
		class="flex flex-col gap-4"
		@submit="send"
	>
		<div class="grid gap-4 sm:grid-cols-2">
			<UFormField label="Your name" name="name" required>
				<UInput v-model="state.name" autocomplete="name" />
			</UFormField>
			<UFormField label="Company" name="company" hint="Optional">
				<UInput v-model="state.company" autocomplete="organization" />
			</UFormField>
			<UFormField label="Email" name="email" required>
				<UInput v-model="state.email" type="email" autocomplete="email" />
			</UFormField>
			<UFormField label="Phone" name="phone" hint="Optional">
				<UInput v-model="state.phone" type="tel" autocomplete="tel" />
			</UFormField>
		</div>
		<UFormField label="What do you have in mind?" name="message" required>
			<UTextarea
				v-model="state.message"
				:rows="4"
				placeholder="Tell us about your business and the kind of partnership you’re interested in."
				class="w-full"
			/>
		</UFormField>

		<!-- left empty by people, who never see it; filled in by bots -->
		<div
			class="pointer-events-none absolute size-0 overflow-hidden opacity-0"
			aria-hidden="true"
		>
			<label>
				Website
				<input v-model="website" type="text" tabindex="-1" autocomplete="off" />
			</label>
		</div>

		<UAlert
			v-if="error"
			color="error"
			variant="subtle"
			icon="i-heroicons-exclamation-triangle"
			:description="error"
		/>

		<div class="flex justify-end gap-2">
			<UButton
				color="neutral"
				variant="ghost"
				:disabled="sending"
				@click="$emit('done')"
				>Cancel</UButton
			>
			<UButton type="submit" :loading="sending" class="px-6"
				>Send enquiry</UButton
			>
		</div>
	</UForm>
</template>

<script setup lang="ts">
	defineEmits<{ done: [] }>();

	const state = reactive({
		name: "",
		company: "",
		email: "",
		phone: "",
		message: "",
	});
	const website = ref("");

	const sending = ref(false);
	const sent = ref(false);
	const sentTo = ref("");
	const error = ref("");

	const send = async () => {
		sending.value = true;
		error.value = "";
		try {
			await $fetch("/api/sponsor-enquiries", {
				method: "POST",
				body: { ...state, website: website.value },
			});
			sentTo.value = state.name.trim().split(/\s+/)[0] ?? "";
			sent.value = true;
		} catch (failure) {
			const statusCode = (failure as { statusCode?: number }).statusCode;
			error.value =
				statusCode === 429
					? "You’ve sent several enquiries in a short time. Please try again later."
					: fetchErrorMessage(failure);
		} finally {
			sending.value = false;
		}
	};
</script>
