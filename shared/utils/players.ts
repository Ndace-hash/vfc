import { z } from "zod";

// The codes and feet below are the only values the `players` table accepts
// (check constraints players_position_check and players_preferred_foot_check).
export const PLAYER_POSITIONS = [
	{ code: "GK", label: "Goalkeeper", group: "Goalkeepers" },
	{ code: "CB", label: "Centre Back", group: "Defenders" },
	{ code: "LB", label: "Left Back", group: "Defenders" },
	{ code: "RB", label: "Right Back", group: "Defenders" },
	{ code: "LWB", label: "Left Wing Back", group: "Defenders" },
	{ code: "RWB", label: "Right Wing Back", group: "Defenders" },
	{ code: "CDM", label: "Defensive Midfielder", group: "Midfielders" },
	{ code: "CM", label: "Central Midfielder", group: "Midfielders" },
	{ code: "CAM", label: "Attacking Midfielder", group: "Midfielders" },
	{ code: "LM", label: "Left Midfielder", group: "Midfielders" },
	{ code: "RM", label: "Right Midfielder", group: "Midfielders" },
	{ code: "LW", label: "Left Winger", group: "Forwards" },
	{ code: "RW", label: "Right Winger", group: "Forwards" },
	{ code: "CF", label: "Centre Forward", group: "Forwards" },
	{ code: "ST", label: "Striker", group: "Forwards" },
] as const;

export type PlayerPositionCode = (typeof PLAYER_POSITIONS)[number]["code"];
export type PlayerPositionGroup = (typeof PLAYER_POSITIONS)[number]["group"];

export const PLAYER_POSITION_CODES = PLAYER_POSITIONS.map(
	(position) => position.code,
) as [PlayerPositionCode, ...PlayerPositionCode[]];

export const playerPosition = (code: string | null | undefined) =>
	PLAYER_POSITIONS.find((position) => position.code === code);

export const PREFERRED_FEET = ["left", "right", "both"] as const;

export const blankToNull = (value: unknown) =>
	value === undefined || (typeof value === "string" && value.trim() === "")
		? null
		: value;

const today = () => new Date().toISOString().slice(0, 10);

const isoDate = z.iso.date("Use the date format YYYY-MM-DD");

// Validates a player as it is written to the Supabase `players` table.
// Shared by the admin form, the import preview and the server routes.
export const playerInputSchema = z.object({
	full_name: z
		.string("Name is required")
		.trim()
		.min(2, "Name is required")
		.max(120, "Name is too long"),
	position: z.enum(
		PLAYER_POSITION_CODES,
		`Position must be one of: ${PLAYER_POSITION_CODES.join(", ")}`,
	),
	jersey_number: z.preprocess(
		blankToNull,
		z
			.number("Jersey number must be a number")
			.int("Jersey number must be a whole number")
			.min(1, "Jersey number must be between 1 and 99")
			.max(99, "Jersey number must be between 1 and 99")
			.nullable(),
	),
	date_of_birth: z.preprocess(
		blankToNull,
		isoDate
			.refine((date) => date <= today(), "Date of birth is in the future")
			.refine((date) => date >= "1940-01-01", "Date of birth is too far back")
			.nullable(),
	),
	nationality: z.preprocess(
		blankToNull,
		z.string().trim().max(80, "Nationality is too long").nullable(),
	),
	preferred_foot: z.preprocess(
		blankToNull,
		z
			.enum(PREFERRED_FEET, "Preferred foot must be Left, Right or Both")
			.nullable(),
	),
	height_cm: z.preprocess(
		blankToNull,
		z
			.number("Height must be a number in centimetres")
			.int("Height must be a whole number of centimetres")
			.min(100, "Height must be between 100 and 250 cm")
			.max(250, "Height must be between 100 and 250 cm")
			.nullable(),
	),
	joined_at: z.preprocess(blankToNull, isoDate.nullable()),
	bio: z.preprocess(
		blankToNull,
		z.string().trim().max(2000, "Bio is too long").nullable(),
	),
	photo_url: z.preprocess(
		blankToNull,
		z.url("Photo must be a full URL starting with http").nullable(),
	),
	is_active: z.boolean().default(true),
});

export type PlayerInput = z.output<typeof playerInputSchema>;
export type PlayerField = keyof PlayerInput;

export const PLAYER_FIELD_LABELS: Record<PlayerField, string> = {
	full_name: "Full Name",
	position: "Position",
	jersey_number: "Jersey Number",
	date_of_birth: "Date of Birth",
	nationality: "Nationality",
	preferred_foot: "Preferred Foot",
	height_cm: "Height (cm)",
	joined_at: "Date Joined",
	bio: "Bio",
	photo_url: "Photo URL",
	is_active: "Active",
};

const normalizeName = (name: string) =>
	name.trim().replace(/\s+/g, " ").toLowerCase();

type PlayerIdentity = { full_name: string; date_of_birth?: string | null };

// Two records are the same player when the names match and the dates of birth
// match. If either side has no date of birth, the name alone decides.
export const isSamePlayer = (a: PlayerIdentity, b: PlayerIdentity) =>
	normalizeName(a.full_name) === normalizeName(b.full_name) &&
	(!a.date_of_birth || !b.date_of_birth || a.date_of_birth === b.date_of_birth);

// "Christiana Ogunleye" -> ["Christiana", "Ogunleye"], "Pele" -> ["", "Pele"]
export const splitPlayerName = (fullName: string): [string, string] => {
	const parts = fullName.trim().split(/\s+/);
	const last = parts.pop() ?? "";
	return [parts.join(" "), last];
};

/* ---------- reading players out of a spreadsheet ---------- */

type SheetColumn = PlayerField | "first_name" | "last_name";

const HEADER_ALIASES: Record<string, SheetColumn> = {
	fullname: "full_name",
	name: "full_name",
	player: "full_name",
	playername: "full_name",
	firstname: "first_name",
	lastname: "last_name",
	surname: "last_name",
	position: "position",
	pos: "position",
	jerseynumber: "jersey_number",
	jersey: "jersey_number",
	number: "jersey_number",
	no: "jersey_number",
	shirtnumber: "jersey_number",
	squadnumber: "jersey_number",
	kitnumber: "jersey_number",
	dateofbirth: "date_of_birth",
	dob: "date_of_birth",
	birthdate: "date_of_birth",
	birthday: "date_of_birth",
	nationality: "nationality",
	country: "nationality",
	preferredfoot: "preferred_foot",
	foot: "preferred_foot",
	strongfoot: "preferred_foot",
	heightcm: "height_cm",
	height: "height_cm",
	datejoined: "joined_at",
	joinedat: "joined_at",
	joined: "joined_at",
	joindate: "joined_at",
	bio: "bio",
	about: "bio",
	photourl: "photo_url",
	photo: "photo_url",
	image: "photo_url",
	imageurl: "photo_url",
	active: "is_active",
	isactive: "is_active",
	status: "is_active",
};

// Other ways people write a position, mapped to its code. Codes themselves
// (in any letter case) are always accepted. General words such as "Defender"
// are left out on purpose: they do not say which position is meant.
const POSITION_ALIASES: Record<string, PlayerPositionCode> = {
	goalkeeper: "GK",
	keeper: "GK",
	goalie: "GK",
	centreback: "CB",
	centerback: "CB",
	centrehalf: "CB",
	centerhalf: "CB",
	centraldefender: "CB",
	leftback: "LB",
	rightback: "RB",
	leftwingback: "LWB",
	rightwingback: "RWB",
	defensivemidfielder: "CDM",
	defensivemidfield: "CDM",
	holdingmidfielder: "CDM",
	dm: "CDM",
	centralmidfielder: "CM",
	centralmidfield: "CM",
	centremidfielder: "CM",
	centermidfielder: "CM",
	attackingmidfielder: "CAM",
	attackingmidfield: "CAM",
	am: "CAM",
	leftmidfielder: "LM",
	leftmidfield: "LM",
	rightmidfielder: "RM",
	rightmidfield: "RM",
	leftwinger: "LW",
	leftwing: "LW",
	rightwinger: "RW",
	rightwing: "RW",
	centreforward: "CF",
	centerforward: "CF",
	striker: "ST",
};

const toPositionCode = (value: unknown) => {
	const text = letters(value);
	return (
		PLAYER_POSITION_CODES.find((code) => code.toLowerCase() === text) ??
		POSITION_ALIASES[text]
	);
};

const FOOT_ALIASES: Record<string, (typeof PREFERRED_FEET)[number]> = {
	left: "left",
	l: "left",
	right: "right",
	r: "right",
	both: "both",
	either: "both",
};

const MONTHS = [
	"jan",
	"feb",
	"mar",
	"apr",
	"may",
	"jun",
	"jul",
	"aug",
	"sep",
	"oct",
	"nov",
	"dec",
];

const letters = (value: unknown) =>
	String(value ?? "")
		.toLowerCase()
		.replace(/[^a-z0-9]/g, "");

const isBlank = (value: unknown) =>
	value === null || value === undefined || String(value).trim() === "";

const toIsoDate = (year: number, month: number, day: number) => {
	const date = new Date(Date.UTC(year, month - 1, day));
	const real =
		date.getUTCFullYear() === year &&
		date.getUTCMonth() === month - 1 &&
		date.getUTCDate() === day;
	return real ? date.toISOString().slice(0, 10) : null;
};

const fullYear = (year: number) => {
	if (year >= 100) return year;
	const thisYear = new Date().getUTCFullYear() % 100;
	return year <= thisYear ? 2000 + year : 1900 + year;
};

// Accepts Excel date cells, Excel serial numbers and the usual ways people
// type dates. Slash dates are read day first (25/12/2001), as used in Nigeria.
// Returns undefined when the value is not a recognisable date.
export const parseSheetDate = (value: unknown): string | null | undefined => {
	if (isBlank(value)) return null;
	if (value instanceof Date) {
		return Number.isNaN(value.getTime())
			? undefined
			: value.toISOString().slice(0, 10);
	}
	if (typeof value === "number") {
		if (value < 1 || value > 80000) return undefined;
		// Excel counts days from 30 December 1899
		return new Date(Date.UTC(1899, 11, 30) + Math.round(value) * 86400000)
			.toISOString()
			.slice(0, 10);
	}
	const text = String(value).trim();
	let match = text.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
	if (match) {
		return toIsoDate(+match[1]!, +match[2]!, +match[3]!) ?? undefined;
	}
	match = text.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2}|\d{4})$/);
	if (match) {
		let day = +match[1]!;
		let month = +match[2]!;
		// 12/25/2001 can only be month first
		if (month > 12 && day <= 12) [day, month] = [month, day];
		return toIsoDate(fullYear(+match[3]!), month, day) ?? undefined;
	}
	match =
		text.match(
			/^(\d{1,2})(?:st|nd|rd|th)?[\s-]+([a-z]{3,})\.?,?[\s-]+(\d{4})$/i,
		) ?? null;
	if (match) {
		const month = MONTHS.indexOf(match[2]!.slice(0, 3).toLowerCase()) + 1;
		return month
			? (toIsoDate(+match[3]!, month, +match[1]!) ?? undefined)
			: undefined;
	}
	match = text.match(
		/^([a-z]{3,})\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})$/i,
	);
	if (match) {
		const month = MONTHS.indexOf(match[1]!.slice(0, 3).toLowerCase()) + 1;
		return month
			? (toIsoDate(+match[3]!, month, +match[2]!) ?? undefined)
			: undefined;
	}
	return undefined;
};

const parseSheetNumber = (value: unknown) => {
	if (typeof value === "number") return value;
	const text = String(value).trim().replace(/^#/, "");
	return /^-?\d+(\.\d+)?$/.test(text) ? Number(text) : value;
};

// "180", "180cm", "1.8" and "1.80 m" all mean 180
const parseSheetHeight = (value: unknown) => {
	const text = String(value).trim().toLowerCase();
	const match = text.match(/^(\d+(?:\.\d+)?)\s*(cm|m)?$/);
	if (!match) return value;
	const amount = Number(match[1]);
	return match[2] === "m" || amount < 3 ? Math.round(amount * 100) : amount;
};

const parseSheetBoolean = (value: unknown) => {
	if (typeof value === "boolean") return value;
	const text = letters(value);
	if (["yes", "y", "true", "1", "active"].includes(text)) return true;
	if (["no", "n", "false", "0", "inactive"].includes(text)) return false;
	return value;
};

export interface SheetColumnMap {
	columns: (SheetColumn | null)[];
	// headers that do not match any player field and will be ignored
	ignored: string[];
	// required columns that are not in the sheet
	missing: string[];
}

export const mapSheetHeaders = (headers: unknown[]): SheetColumnMap => {
	const ignored: string[] = [];
	const columns = headers.map((header) => {
		const text = String(header ?? "").trim();
		const column =
			text === "#" ? "jersey_number" : (HEADER_ALIASES[letters(text)] ?? null);
		if (!column && text) ignored.push(text);
		return column;
	});
	const has = (column: SheetColumn) => columns.includes(column);
	const missing: string[] = [];
	if (!has("full_name") && !(has("first_name") && has("last_name"))) {
		missing.push(PLAYER_FIELD_LABELS.full_name);
	}
	if (!has("position")) missing.push(PLAYER_FIELD_LABELS.position);
	return { columns, ignored, missing };
};

export interface SheetPlayerRow {
	// row number as shown in the spreadsheet (the header is row 1)
	row: number;
	// values after clean-up, for display even when the row is invalid
	values: Partial<Record<PlayerField, unknown>>;
	// set only when the row passed validation
	player: PlayerInput | null;
	errors: string[];
}

export const parseSheetRow = (
	cells: unknown[],
	columns: SheetColumnMap["columns"],
	row: number,
): SheetPlayerRow => {
	const raw: Partial<Record<SheetColumn, unknown>> = {};
	columns.forEach((column, index) => {
		if (column && !isBlank(cells[index]) && raw[column] === undefined) {
			raw[column] = cells[index];
		}
	});

	const errors: string[] = [];
	const values: SheetPlayerRow["values"] = {};

	const name =
		raw.full_name ?? [raw.first_name, raw.last_name].filter(Boolean).join(" ");
	values.full_name = String(name ?? "")
		.trim()
		.replace(/\s+/g, " ");

	if (raw.position !== undefined) {
		values.position = toPositionCode(raw.position) ?? raw.position;
	}
	if (raw.jersey_number !== undefined) {
		values.jersey_number = parseSheetNumber(raw.jersey_number);
	}
	for (const field of ["date_of_birth", "joined_at"] as const) {
		if (raw[field] === undefined) continue;
		const date = parseSheetDate(raw[field]);
		if (date === undefined) {
			errors.push(
				`${PLAYER_FIELD_LABELS[field]} "${raw[field]}" is not a date. Use DD/MM/YYYY or YYYY-MM-DD`,
			);
			values[field] = String(raw[field]);
		} else {
			values[field] = date;
		}
	}
	if (raw.nationality !== undefined)
		values.nationality = String(raw.nationality);
	if (raw.preferred_foot !== undefined) {
		values.preferred_foot =
			FOOT_ALIASES[letters(raw.preferred_foot)] ?? raw.preferred_foot;
	}
	if (raw.height_cm !== undefined)
		values.height_cm = parseSheetHeight(raw.height_cm);
	if (raw.bio !== undefined) values.bio = String(raw.bio);
	if (raw.photo_url !== undefined)
		values.photo_url = String(raw.photo_url).trim();
	if (raw.is_active !== undefined) {
		values.is_active = parseSheetBoolean(raw.is_active);
		if (typeof values.is_active !== "boolean") {
			errors.push(`Active "${raw.is_active}" must be Yes or No`);
		}
	}

	if (errors.length) return { row, values, player: null, errors };

	const result = playerInputSchema.safeParse(values);
	if (!result.success) {
		return {
			row,
			values,
			player: null,
			errors: result.error.issues.map((issue) => issue.message),
		};
	}
	return { row, values, player: result.data, errors: [] };
};

// Turns the rows of a sheet (header row first) into validated players.
export const parsePlayerSheet = (rows: unknown[][]) => {
	const [headers = [], ...body] = rows;
	const map = mapSheetHeaders(headers);
	const players = body
		.map((cells, index) => ({ cells, row: index + 2 }))
		.filter(({ cells }) => cells.some((cell) => !isBlank(cell)))
		.map(({ cells, row }) => parseSheetRow(cells, map.columns, row));
	return { ...map, players };
};
