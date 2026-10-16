import type { EnquiryStatus, SponsorTier } from "#shared/utils/sponsors";

// A row of the Supabase `sponsors` table
export interface Sponsor {
	id: number;
	created_at: string;
	updated_at: string;
	name: string;
	logo_url: string | null;
	website_url: string | null;
	tier: SponsorTier;
	display_order: number;
	// hidden from the public site when false
	is_active: boolean;
}

// A sponsor as the public site gets it from /api/sponsors
export type PublicSponsor = Pick<
	Sponsor,
	"id" | "name" | "logo_url" | "website_url" | "tier"
>;

// A row of the Supabase `sponsor_enquiries` table
export interface SponsorEnquiry {
	id: number;
	created_at: string;
	updated_at: string;
	name: string;
	company: string | null;
	email: string;
	phone: string | null;
	message: string;
	status: EnquiryStatus;
	// staff-only
	notes: string;
}
