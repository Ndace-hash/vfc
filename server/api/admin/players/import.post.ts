import { z } from "zod";
import type { Player } from "~/types/Player";

const MAX_ROWS = 1000;

const bodySchema = z.object({
	// `row` is the spreadsheet row number, echoed back so the admin can find it
	players: z
		.array(z.looseObject({ row: z.number().int() }))
		.min(1)
		.max(MAX_ROWS),
});

interface RowReport {
	row: number;
	full_name: string;
	reason: string;
}

// Bulk add players. Rows that match an existing player (or an earlier row in
// the same file) are skipped, invalid rows are reported, the rest are inserted.
export default defineEventHandler(async (event) => {
	const body = bodySchema.safeParse(await readBody(event));
	if (!body.success) {
		throw createError({
			statusCode: 400,
			statusMessage: `Send between 1 and ${MAX_ROWS} players`,
		});
	}

	const skipped: RowReport[] = [];
	const failed: RowReport[] = [];
	const accepted: { row: number; player: PlayerInput }[] = [];

	const existing = await fetchAllPlayers<
		Pick<Player, "full_name" | "date_of_birth">
	>("full_name, date_of_birth");

	for (const { row, ...values } of body.data.players) {
		const full_name = String(values.full_name ?? "");
		const result = playerInputSchema.safeParse(values);
		if (!result.success) {
			failed.push({
				row,
				full_name,
				reason: result.error.issues.map((issue) => issue.message).join(". "),
			});
		} else if (existing.some((player) => isSamePlayer(player, result.data))) {
			skipped.push({ row, full_name, reason: "Already in the database" });
		} else if (
			accepted.some(({ player }) => isSamePlayer(player, result.data))
		) {
			skipped.push({
				row,
				full_name,
				reason: "Appears more than once in the file",
			});
		} else {
			accepted.push({ row, player: result.data });
		}
	}

	const supabase = useSupabaseAdmin();
	const inserted: Player[] = [];
	if (accepted.length) {
		const { data, error } = await supabase
			.from("players")
			.insert(accepted.map(({ player }) => player))
			.select();
		if (!error) {
			inserted.push(...(data as Player[]));
		} else {
			// A batch insert is all or nothing. Retry one row at a time so a single
			// bad row does not block the rest, and report exactly which rows failed.
			for (const { row, player } of accepted) {
				const single = await supabase
					.from("players")
					.insert(player)
					.select()
					.single();
				if (single.error) {
					failed.push({
						row,
						full_name: player.full_name,
						reason: single.error.message,
					});
				} else {
					inserted.push(single.data as Player);
				}
			}
		}
	}

	return { inserted, skipped, failed };
});
