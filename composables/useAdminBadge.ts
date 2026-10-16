// Where each sidebar badge gets its number
const BADGE_SOURCES = {
	// sponsor enquiries nobody has handled yet
	enquiries: "/api/admin/sponsor-enquiries/count",
	// orders that are paid and waiting, or need attention
	orders: "/api/admin/orders/count",
};
export type AdminBadge = keyof typeof BADGE_SOURCES;

// The number on a sidebar badge. Shared, so a page can update it straight
// away when staff deal with something.
export const useAdminBadge = (badge: AdminBadge) => {
	const count = useState(`admin-badge-${badge}`, () => 0);
	const adminFetch = useAdminFetch();

	const refresh = async () => {
		try {
			count.value = (await adminFetch<{ count: number }>(BADGE_SOURCES[badge])).count;
		} catch {
			// the badge is only a hint; keep the last number
		}
	};

	return { count, refresh };
};
