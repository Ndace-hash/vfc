import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | undefined;

// Server-only Supabase client. It uses the secret key, which bypasses row
// level security, so it must never be imported into anything that runs in
// the browser.
export const useSupabaseAdmin = () => {
	if (client) return client;

	const config = useRuntimeConfig();
	// runtimeConfig only sees these if they were set when the app was built,
	// so also read them from the running server's environment
	const url = config.public.supabaseUrl || process.env.SUPABASE_URL;
	const secretKey = config.supabaseSecretKey || process.env.SUPABASE_SECRET_KEY;
	if (!url || !secretKey) {
		throw createError({
			statusCode: 500,
			statusMessage: "Supabase is not configured",
			message:
				"Supabase is not configured: set SUPABASE_URL and SUPABASE_SECRET_KEY in .env",
		});
	}

	client = createClient(url, secretKey, {
		auth: { persistSession: false, autoRefreshToken: false },
	});
	return client;
};

// Columns the public site is allowed to see
export const PUBLIC_PLAYER_COLUMNS =
	"id, full_name, position, jersey_number, date_of_birth, nationality, preferred_foot, height_cm, bio, photo_url";

export const failOnSupabaseError = (
	error: { message: string } | null,
	action: string,
) => {
	if (!error) return;
	console.error(`[supabase] ${action}:`, error);
	throw createError({
		statusCode: 502,
		statusMessage: "Database error",
		message: `${action}: ${error.message}`,
	});
};
