import { z } from "zod";
import { blankToNull, parseSheetDate } from "./players";

// Kick-off times are entered and shown in the club's local time.
// Nigeria does not use daylight saving time, so the offset never changes.
export const CLUB_TIME_ZONE = "Africa/Lagos";
const CLUB_UTC_OFFSET = "+01:00";

// "2026-10-18" + "15:00" -> "2026-10-18T15:00:00+01:00"
export const toKickoff = (date: string, time: string) =>
	`${date}T${time}:00${CLUB_UTC_OFFSET}`;

// The club-time date ("2026-10-18") and time ("15:00") of a stored kick-off
export const kickoffParts = (startTime: string) => {
	const parts = new Intl.DateTimeFormat("en-CA", {
		timeZone: CLUB_TIME_ZONE,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		hourCycle: "h23",
	}).formatToParts(new Date(startTime));
	const part = (type: string) =>
		parts.find((item) => item.type === type)?.value ?? "";
	return {
		date: `${part("year")}-${part("month")}-${part("day")}`,
		time: `${part("hour")}:${part("minute")}`,
	};
};

// "Sat 18 Oct 2026"
export const formatKickoffDay = (startTime: string) =>
	new Date(startTime).toLocaleDateString("en-GB", {
		timeZone: CLUB_TIME_ZONE,
		weekday: "short",
		day: "numeric",
		month: "short",
		year: "numeric",
	});

const score = z.preprocess(
	blankToNull,
	z
		.number("Scores must be numbers")
		.int("Scores must be whole numbers")
		.min(0, "Scores cannot be negative")
		.max(99, "Score is too high")
		.nullable(),
);

// Validates a fixture as it is written to the Supabase `matches` table.
// Shared by the admin form, the import preview and the server routes.
export const matchInputSchema = z
	.object({
		home_team: z.uuid("Choose the home team"),
		away_team: z.uuid("Choose the away team"),
		start_time: z.iso.datetime({
			offset: true,
			message: "Kick-off date and time are required",
		}),
		// both empty until the match has been played
		home_score: score,
		away_score: score,
	})
	.refine((match) => match.home_team !== match.away_team, {
		message: "Home and away must be different teams",
		path: ["away_team"],
	})
	.refine(
		(match) => (match.home_score === null) === (match.away_score === null),
		{
			message: "Enter both scores, or leave both empty",
			path: ["away_score"],
		},
	);

export type MatchInput = z.output<typeof matchInputSchema>;

// The same two teams on the same day is the same fixture
export const isSameFixture = (
	a: Pick<MatchInput, "home_team" | "away_team" | "start_time">,
	b: Pick<MatchInput, "home_team" | "away_team" | "start_time">,
) =>
	a.home_team === b.home_team &&
	a.away_team === b.away_team &&
	kickoffParts(a.start_time).date === kickoffParts(b.start_time).date;

/* ---------- reading fixtures out of a spreadsheet ---------- */

type FixtureColumn =
	"date" | "time" | "home" | "away" | "home_score" | "away_score" | "score";

const FIXTURE_HEADER_ALIASES: Record<string, FixtureColumn> = {
	date: "date",
	matchdate: "date",
	fixturedate: "date",
	day: "date",
	kickoff: "time",
	kickofftime: "time",
	ko: "time",
	time: "time",
	hometeam: "home",
	home: "home",
	awayteam: "away",
	away: "away",
	homescore: "home_score",
	homegoals: "home_score",
	awayscore: "away_score",
	awaygoals: "away_score",
	score: "score",
	result: "score",
};

const isBlank = (value: unknown) =>
	value === null || value === undefined || String(value).trim() === "";

const letters = (value: unknown) =>
	String(value ?? "")
		.toLowerCase()
		.replace(/[^a-z0-9]/g, "");

const twoDigits = (value: number) => String(value).padStart(2, "0");

const toTime = (hours: number, minutes: number) =>
	hours < 24 && minutes < 60
		? `${twoDigits(hours)}:${twoDigits(minutes)}`
		: undefined;

// Accepts Excel time cells and typed times such as 15:00, 15.00, 3pm or
// 3:30 PM. Returns "HH:MM", null when empty, undefined when not a time.
export const parseSheetTime = (value: unknown): string | null | undefined => {
	if (isBlank(value)) return null;
	if (value instanceof Date) {
		return Number.isNaN(value.getTime())
			? undefined
			: toTime(value.getUTCHours(), value.getUTCMinutes());
	}
	if (typeof value === "number") {
		// Excel stores a time as a fraction of a day
		if (value < 0 || value >= 1) return undefined;
		const minutes = Math.round(value * 1440);
		return toTime(Math.floor(minutes / 60), minutes % 60);
	}
	const match = String(value)
		.trim()
		.toLowerCase()
		.match(/^(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm)?$/);
	if (!match) return undefined;
	let hours = Number(match[1]);
	const minutes = Number(match[2] ?? 0);
	if (match[3]) {
		if (hours < 1 || hours > 12) return undefined;
		hours = (hours % 12) + (match[3] === "pm" ? 12 : 0);
	} else if (match[2] === undefined) {
		// a bare "3" could be morning or afternoon
		return undefined;
	}
	return toTime(hours, minutes);
};

const parseScore = (value: unknown) => {
	if (isBlank(value)) return null;
	const text = String(value).trim();
	return /^\d+$/.test(text) ? Number(text) : undefined;
};

export interface FixtureSheetMap {
	columns: (FixtureColumn | null)[];
	// headers that do not match a fixture field and will be ignored
	ignored: string[];
	// required columns that are not in the sheet
	missing: string[];
}

export const mapFixtureHeaders = (headers: unknown[]): FixtureSheetMap => {
	const ignored: string[] = [];
	const columns = headers.map((header) => {
		const text = String(header ?? "").trim();
		const column = FIXTURE_HEADER_ALIASES[letters(text)] ?? null;
		if (!column && text) ignored.push(text);
		return column;
	});
	const missing = (
		[
			["date", "Date"],
			["home", "Home Team"],
			["away", "Away Team"],
		] as const
	)
		.filter(([column]) => !columns.includes(column))
		.map(([, label]) => label);
	return { columns, ignored, missing };
};

export interface SheetFixtureRow {
	// row number as shown in the spreadsheet (the header is row 1)
	row: number;
	// team names exactly as typed; they are matched to teams afterwards
	home: string;
	away: string;
	// club-time date and time, or the raw text when they could not be read
	date: string;
	time: string;
	// set when both the date and the time could be read
	start_time: string | null;
	home_score: number | null;
	away_score: number | null;
	// problems with the values themselves (team names are checked later)
	errors: string[];
}

export const parseFixtureRow = (
	cells: unknown[],
	columns: FixtureSheetMap["columns"],
	row: number,
): SheetFixtureRow => {
	const raw: Partial<Record<FixtureColumn, unknown>> = {};
	columns.forEach((column, index) => {
		if (column && !isBlank(cells[index]) && raw[column] === undefined) {
			raw[column] = cells[index];
		}
	});

	const errors: string[] = [];
	const name = (value: unknown) =>
		String(value ?? "")
			.trim()
			.replace(/\s+/g, " ");
	const home = name(raw.home);
	const away = name(raw.away);
	if (!home) errors.push("Home team is missing");
	if (!away) errors.push("Away team is missing");

	// the date cell may also carry the time: a date-time cell, or "18/10/2026 15:00"
	let dateValue = raw.date;
	let timeValue = raw.time;
	if (timeValue === undefined && dateValue instanceof Date) {
		const time = parseSheetTime(dateValue);
		if (time && time !== "00:00") timeValue = time;
	}
	if (typeof dateValue === "string") {
		const split = dateValue
			.trim()
			.match(/^(.+?)[\sT]+(\d{1,2}[:.]\d{2}\s*(?:am|pm)?)$/i);
		if (split) {
			dateValue = split[1];
			if (timeValue === undefined) timeValue = split[2];
		}
	}

	const date = parseSheetDate(dateValue);
	if (date === null) errors.push("Date is missing");
	if (date === undefined) {
		errors.push(
			`Date "${dateValue}" is not a date. Use DD/MM/YYYY or YYYY-MM-DD`,
		);
	}
	const time = parseSheetTime(timeValue);
	if (time === null) errors.push("Kick-off time is missing");
	if (time === undefined) {
		errors.push(
			`Kick-off "${timeValue}" is not a time. Use 24-hour time like 15:00`,
		);
	}

	let homeScore = parseScore(raw.home_score);
	let awayScore = parseScore(raw.away_score);
	if (
		raw.score !== undefined &&
		raw.home_score === undefined &&
		raw.away_score === undefined
	) {
		// "2-1", "2 - 1" or "2:1"
		const result = String(raw.score)
			.trim()
			.match(/^(\d+)\s*[-:–]\s*(\d+)$/);
		if (result) {
			homeScore = Number(result[1]);
			awayScore = Number(result[2]);
		} else {
			homeScore = awayScore = undefined;
		}
	}
	if (homeScore === undefined || awayScore === undefined) {
		errors.push("Scores must be whole numbers, like 2 and 1 or 2-1");
	} else if ((homeScore === null) !== (awayScore === null)) {
		errors.push("Enter both scores, or leave both empty");
	}

	return {
		row,
		home,
		away,
		date: date ?? String(dateValue ?? ""),
		time: time ?? String(timeValue ?? ""),
		start_time: date && time ? toKickoff(date, time) : null,
		home_score: homeScore ?? null,
		away_score: awayScore ?? null,
		errors,
	};
};

// Turns the rows of a sheet (header row first) into fixtures with team names.
export const parseFixtureSheet = (rows: unknown[][]) => {
	const [headers = [], ...body] = rows;
	const map = mapFixtureHeaders(headers);
	const fixtures = body
		.map((cells, index) => ({ cells, row: index + 2 }))
		.filter(({ cells }) => cells.some((cell) => !isBlank(cell)))
		.map(({ cells, row }) => parseFixtureRow(cells, map.columns, row));
	return { ...map, fixtures };
};
