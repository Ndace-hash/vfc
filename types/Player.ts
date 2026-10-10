// A row of the Supabase `players` table
export interface Player {
	id: string;
	full_name: string;
	position: string | null;
	jersey_number: number | null;
	date_of_birth: string | null;
	nationality: string | null;
	preferred_foot: string | null;
	height_cm: number | null;
	bio: string | null;
	photo_url: string | null;
	joined_at: string | null;
	team_id: string | null;
	is_active: boolean;
	created_at: string;
	updated_at: string;
}

// What /api/players returns to the public site
export type PublicPlayer = Pick<
	Player,
	| "id"
	| "full_name"
	| "position"
	| "jersey_number"
	| "date_of_birth"
	| "nationality"
	| "preferred_foot"
	| "height_cm"
	| "bio"
	| "photo_url"
>;
