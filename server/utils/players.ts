import type { Player } from "~/types/Player";

const PAGE_SIZE = 1000;

// Supabase returns at most 1000 rows per request, so read in pages
export const fetchAllPlayers = async <T = Player>(columns = "*") => {
	const supabase = useSupabaseAdmin();
	const players: T[] = [];
	for (let from = 0; ; from += PAGE_SIZE) {
		const { data, error } = await supabase
			.from("players")
			.select(columns)
			.order("full_name")
			.order("id")
			.range(from, from + PAGE_SIZE - 1);
		failOnSupabaseError(error, "Could not load players");
		players.push(...((data ?? []) as T[]));
		if (!data || data.length < PAGE_SIZE) return players;
	}
};

// Reads and validates a player from the request body
export const readPlayerBody = async (event: Parameters<typeof readBody>[0]) => {
	const result = playerInputSchema.safeParse(await readBody(event));
	if (!result.success) {
		throw createError({
			statusCode: 400,
			statusMessage: "Invalid player",
			message: result.error.issues.map((issue) => issue.message).join(". "),
		});
	}
	return result.data;
};
