import type { SponsorEnquiry } from "~/types/Sponsor";

// Newest first
export default defineEventHandler(async () => {
	const { data, error } = await useSupabaseAdmin()
		.from("sponsor_enquiries")
		.select("*")
		.order("created_at", { ascending: false });
	failOnSupabaseError(error, "Could not load enquiries");
	return (data ?? []) as SponsorEnquiry[];
});
