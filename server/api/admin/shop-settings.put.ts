import type { ShopSettings } from "~/types/Shop";

export default defineEventHandler(async (event) => {
	const { delivery_fee, ...settings } = await readBodyAs(
		event,
		shopSettingsSchema,
		"Invalid settings",
	);
	const { data, error } = await useSupabaseAdmin()
		.from("shop_settings")
		.update({
			...settings,
			delivery_fee_kobo: toKobo(delivery_fee),
			updated_at: new Date().toISOString(),
		})
		.eq("id", true)
		.select("pickup_address, delivery_fee_kobo, outside_lagos_message, updated_at")
		.single();
	failOnSupabaseError(error, "Could not save the shop settings");
	return data as ShopSettings;
});
