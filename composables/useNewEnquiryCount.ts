// The number on the sidebar's Enquiries badge. Shared, so the Enquiries page
// can update it straight away when staff change a status.
export const useNewEnquiryCount = () => {
	const count = useState("new-enquiry-count", () => 0);
	const adminFetch = useAdminFetch();

	const refresh = async () => {
		try {
			const result = await adminFetch<{ new: number }>(
				"/api/admin/sponsor-enquiries/count",
			);
			count.value = result.new;
		} catch {
			// the badge is only a hint; keep the last number
		}
	};

	return { count, refresh };
};
