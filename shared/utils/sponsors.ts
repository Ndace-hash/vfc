import { z } from "zod";
import { blankToNull } from "./players";

export const SPONSOR_TIERS = [
	{ value: "main", label: "Main sponsor" },
	{ value: "partner", label: "Partner" },
] as const;
export type SponsorTier = (typeof SPONSOR_TIERS)[number]["value"];

export const ENQUIRY_STATUSES = [
	{ value: "new", label: "New" },
	{ value: "contacted", label: "Contacted" },
	{ value: "closed", label: "Closed" },
] as const;
export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number]["value"];

const valuesOf = <T extends readonly { value: string }[]>(items: T) =>
	items.map((item) => item.value) as [T[number]["value"], ...T[number]["value"][]];

const webLink = (message: string) =>
	z.preprocess(blankToNull, z.url({ protocol: /^https?$/, error: message }).nullable());

// Validates a sponsor as it is written to the Supabase `sponsors` table.
// Shared by the admin form and the server routes.
export const sponsorInputSchema = z.object({
	name: z
		.string("Sponsor name is required")
		.trim()
		.min(1, "Sponsor name is required")
		.max(120, "Sponsor name is too long"),
	tier: z.enum(valuesOf(SPONSOR_TIERS), "Choose a tier"),
	website_url: webLink("Website must be a full link starting with http"),
	// set by the upload; a sponsor without a logo is shown by name
	logo_url: webLink("Logo must be a full link starting with http"),
	// lower numbers are shown first; left empty, it is 0
	display_order: z.preprocess(
		(value) => (value === "" || value == null ? 0 : value),
		z
			.number("Order must be a number")
			.int("Order must be a whole number")
			.min(0, "Order cannot be negative")
			.max(999, "Order is too high"),
	),
	is_active: z.boolean().default(true),
});

export type SponsorInput = z.output<typeof sponsorInputSchema>;

// The public "Become a sponsor" form. The server checks it again before saving.
export const sponsorEnquirySchema = z.object({
	name: z
		.string("Your name is required")
		.trim()
		.min(1, "Your name is required")
		.max(200, "Name is too long"),
	company: z.preprocess(
		blankToNull,
		z.string().trim().max(200, "Company name is too long").nullable(),
	),
	email: z
		.string("Your email is required")
		.trim()
		.min(1, "Your email is required")
		.pipe(z.email("Enter a valid email address").max(320, "Email is too long")),
	phone: z.preprocess(
		blankToNull,
		z.string().trim().max(40, "Phone number is too long").nullable(),
	),
	message: z
		.string("Tell us a little about what you have in mind")
		.trim()
		.min(10, "Tell us a little more (at least 10 characters)")
		.max(5000, "Message is too long (5,000 characters at most)"),
});

export type SponsorEnquiryInput = z.output<typeof sponsorEnquirySchema>;

// What staff can change on an enquiry in the admin
export const enquiryUpdateSchema = z.object({
	status: z.enum(valuesOf(ENQUIRY_STATUSES), "Choose a status"),
	notes: z.string().max(5000, "Notes are too long").default(""),
});

export type EnquiryUpdate = z.output<typeof enquiryUpdateSchema>;
