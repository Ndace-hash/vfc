import type { Sponsor } from "~/types/Sponsor";

// Postgres error code for a unique index refusing a row
const UNIQUE_VIOLATION = "23505";

// Columns the public site is allowed to see
export const PUBLIC_SPONSOR_COLUMNS = "id, name, logo_url, website_url, tier";

// main sponsor first, then partners in the order staff chose
export const fetchSponsors = async (
	columns = "*",
	{ activeOnly = false } = {},
) => {
	let query = useSupabaseAdmin()
		.from("sponsors")
		.select(columns)
		.order("tier")
		.order("display_order")
		.order("name");
	if (activeOnly) query = query.eq("is_active", true);
	const { data, error } = await query;
	failOnSupabaseError(error, "Could not load sponsors");
	return (data ?? []) as unknown as Sponsor[];
};

// The only unique rule on sponsors is "one main sponsor on the site at a time"
export const failOnSponsorError = (
	error: { code?: string; message: string } | null,
	action: string,
) => {
	if (error?.code === UNIQUE_VIOLATION) {
		throw createError({
			statusCode: 409,
			statusMessage: "There is already a main sponsor",
			message:
				"Only one main sponsor can be shown at a time. Make the current main sponsor a partner, or hide it, first.",
		});
	}
	failOnSupabaseError(error, action);
};
