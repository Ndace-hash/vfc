// What checkout needs: where to collect, what delivery costs
export default defineEventHandler(async () => {
	const { pickup_address, delivery_fee_kobo, outside_lagos_message } =
		await fetchShopSettings();
	return { pickup_address, delivery_fee_kobo, outside_lagos_message };
});
