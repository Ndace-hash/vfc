<template>
	<Head>
		<Title>Shop settings | Valiant FC</Title>
	</Head>
	<section class="px-4">
		<h1 class="text-highlighted text-2xl max-w-[700px] mx-auto my-6">Shop settings</h1>

		<div class="bg-default max-w-[700px] mx-auto rounded-[8px] shadow-sm ring-1 ring-default my-10 p-6">
			<UAlert
				v-if="loadError"
				color="error"
				variant="subtle"
				icon="i-heroicons-exclamation-triangle"
				title="Could not load the settings"
				:description="loadError"
				class="mb-4"
			/>
			<USkeleton v-if="loading" class="h-72" />

			<UForm
				v-else
				:state="state"
				:schema="shopSettingsSchema"
				class="flex flex-col gap-5"
				@submit="save"
			>
				<UFormField
					label="Pickup address"
					name="pickup_address"
					required
					description="Shown to customers who choose pickup, at checkout and on their order."
				>
					<UTextarea v-model="state.pickup_address" :rows="3" class="w-full" />
				</UFormField>
				<UFormField
					label="Delivery fee within Lagos (₦)"
					name="delivery_fee"
					required
					description="One flat fee per order. Set 0 for free delivery."
				>
					<UInput
						v-model.number="state.delivery_fee"
						type="number"
						min="0"
						step="50"
						inputmode="decimal"
						class="max-w-48"
					/>
				</UFormField>
				<UFormField
					label="Message for customers outside Lagos"
					name="outside_lagos_message"
					required
					description="Shown under the delivery option at checkout."
				>
					<UTextarea v-model="state.outside_lagos_message" :rows="2" class="w-full" />
				</UFormField>
				<div class="flex items-center justify-end gap-3">
					<span v-if="savedAt" class="text-sm text-muted">Saved {{ savedAt }}</span>
					<UButton type="submit" :loading="saving" class="px-6">Save</UButton>
				</div>
			</UForm>
		</div>
	</section>
</template>

<script setup lang="ts">
	import type { ShopSettings } from "~/types/Shop";

	definePageMeta({
		layout: "admin",
	});

	const adminFetch = useAdminFetch();
	const toast = useToast();

	const state = reactive({
		pickup_address: "",
		delivery_fee: 0,
		outside_lagos_message: "",
	});
	const loading = ref(true);
	const loadError = ref("");
	const saving = ref(false);
	const savedAt = ref("");

	const show = (settings: ShopSettings) => {
		state.pickup_address = settings.pickup_address;
		state.delivery_fee = toNaira(settings.delivery_fee_kobo);
		state.outside_lagos_message = settings.outside_lagos_message;
	};

	onMounted(async () => {
		try {
			show(await adminFetch<ShopSettings>("/api/admin/shop-settings"));
		} catch (error) {
			loadError.value = fetchErrorMessage(error);
		} finally {
			loading.value = false;
		}
	});

	const save = async () => {
		saving.value = true;
		try {
			show(
				await adminFetch<ShopSettings>("/api/admin/shop-settings", {
					method: "PUT",
					body: { ...state },
				}),
			);
			savedAt.value = new Date().toLocaleTimeString("en-GB", {
				hour: "2-digit",
				minute: "2-digit",
			});
			toast.add({ title: "Shop settings saved", color: "success" });
		} catch (error) {
			toast.add({
				title: "Could not save the settings",
				description: fetchErrorMessage(error),
				color: "error",
			});
		} finally {
			saving.value = false;
		}
	};
</script>
