// Public sponsor list: visible sponsors only, main sponsor first
export default defineEventHandler(() =>
	fetchSponsors(PUBLIC_SPONSOR_COLUMNS, { activeOnly: true }),
);
