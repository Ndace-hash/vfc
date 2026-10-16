// Fills the Supabase project with sample teams, fixtures, sponsors and shop
// products, for trying the site out. Safe to run more than once: anything
// that already exists is left alone.
//
//   npm run seed        add the sample data
//   npm run seed:undo   remove it again
//
// The opposing teams, partner sponsors and products are made up. Their images
// are uploaded under seed/ in the `images` bucket so they are easy to tell
// apart. Two things are real and are kept by seed:undo: the Valiant FC crest
// and Island Casino as the main sponsor.
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const { SUPABASE_URL, SUPABASE_SECRET_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
	console.error("Set SUPABASE_URL and SUPABASE_SECRET_KEY (run with --env-file=.env)");
	process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
	auth: { persistSession: false, autoRefreshToken: false },
});

const BUCKET = "images";
const repoFile = (path) => fileURLToPath(new URL(`../../${path}`, import.meta.url));
const seedImage = (name) => fileURLToPath(new URL(`./images/${name}`, import.meta.url));

const CLUB = "Valiant FC";

// [name, short name, crest image]
const TEAMS = [
	["Lekki Lions FC", "LLFC", "crest-lekki-lions.png"],
	["Surulere Stars", "SUR", "crest-surulere-stars.png"],
	["Yaba United", "YAB", "crest-yaba-united.png"],
	["Ikeja Rangers", "IKR", "crest-ikeja-rangers.png"],
	["Badagry Warriors", "BAD", "crest-badagry-warriors.png"],
	["Epe Eagles", "EPE", "crest-epe-eagles.png"],
	["Ajah Athletic", "AJA", "crest-ajah-athletic.png"],
	["Mushin Rovers", "MUR", "crest-mushin-rovers.png"],
];

// Valiant FC's last six matches, oldest first: [opponent, Valiant at home?, Valiant goals, opponent goals]
const RESULTS = [
	["Lekki Lions FC", true, 2, 1],
	["Surulere Stars", false, 1, 1],
	["Yaba United", true, 3, 0],
	["Ikeja Rangers", false, 0, 2],
	["Badagry Warriors", true, 2, 2],
	["Epe Eagles", false, 1, 0],
];
// the next six, soonest first: [opponent, Valiant at home?]
const FIXTURES = [
	["Ajah Athletic", true],
	["Mushin Rovers", false],
	["Lekki Lions FC", false],
	["Surulere Stars", true],
	["Yaba United", false],
	["Ikeja Rangers", true],
];
// other league matches on the same weekends, kicking off earlier:
// [weeks from now (negative is past), home, away, home goals, away goals]
const OTHER_MATCHES = [
	[-3, "Ajah Athletic", "Mushin Rovers", 1, 0],
	[-2, "Lekki Lions FC", "Epe Eagles", 0, 0],
	[-1, "Surulere Stars", "Badagry Warriors", 2, 3],
	[1, "Yaba United", "Ikeja Rangers"],
	[2, "Badagry Warriors", "Ajah Athletic"],
	[3, "Epe Eagles", "Mushin Rovers"],
];

// [name, tier, logo, website, order]; Island Casino is the club's real sponsor
// (its logo here is an 800px copy of assets/images/island-casino.png, which is 2 MB)
const REAL_SPONSORS = [["Island Casino", "main", "island-casino.png", null, 0]];
const SEED_SPONSORS = [
	["Lagoon Logistics", "partner", "sponsor-lagoon-logistics.png", "https://example.com/lagoon-logistics", 1],
	["Harbourline Bank", "partner", "sponsor-harbourline-bank.png", "https://example.com/harbourline-bank", 2],
	["Pitchside Physio", "partner", "sponsor-pitchside-physio.png", "https://example.com/pitchside-physio", 3],
	["Gidi Bites", "partner", "sponsor-gidi-bites.png", null, 4],
];

const naira = (amount) => amount * 100; // stored in kobo
const SIZES = (stock) => ["S", "M", "L", "XL", "XXL"].map((label, i) => ({ label, stock: stock[i], display_order: i }));
const PRODUCTS = [
	{
		slug: "home-jersey-2026", name: "Home jersey 2026", price: naira(25000), featured: true, order: 1,
		images: ["home-jersey-front.png", "home-jersey-back.png"],
		description: "The green shirt Valiant FC wear at home this season, with the club crest on the chest. Lightweight, breathable fabric.",
		variants: SIZES([4, 12, 15, 8, 0]),
	},
	{
		slug: "away-jersey-2026", name: "Away jersey 2026", price: naira(25000), featured: true, order: 2,
		images: ["away-jersey-front.png", "away-jersey-back.png"],
		description: "This season's white away shirt with green sleeves and trim.",
		variants: SIZES([3, 9, 10, 6, 2]),
	},
	{
		slug: "training-top", name: "Training top", price: naira(15000), featured: true, order: 3,
		images: ["training-top.png"],
		description: "The deep green top the squad trains in. Good for match days and the gym.",
		variants: SIZES([0, 5, 7, 4, 1]),
	},
	{
		slug: "supporters-scarf", name: "Supporters’ scarf", price: naira(8000), featured: true, order: 4,
		images: ["scarf.png"],
		description: "Knitted green and white scarf with VALIANT FC across the middle.",
		variants: [{ label: "One size", stock: 30, display_order: 0 }],
	},
	{
		slug: "club-cap", name: "Club cap", price: naira(6000), featured: false, order: 5,
		images: ["cap.png"],
		description: "Adjustable cap with the embroidered club crest.",
		variants: [{ label: "One size", stock: 18, display_order: 0 }],
	},
	{
		slug: "water-bottle", name: "Water bottle", price: naira(4500), featured: false, order: 6,
		images: ["water-bottle.png"],
		description: "750 ml reusable bottle in club colours.",
		variants: [{ label: "750 ml", stock: 0, display_order: 0 }],
	},
	{
		// hidden: shows how a product looks in the admin before it goes live
		slug: "goalkeeper-jersey-2026", name: "Goalkeeper jersey 2026", price: naira(25000), featured: false, order: 7, active: false,
		images: ["goalkeeper-jersey.png"],
		description: "Coming soon.",
		variants: SIZES([0, 0, 0, 0, 0]),
	},
];

/* ---------- helpers ---------- */

const fail = (error, what) => {
	if (error) throw new Error(`${what}: ${error.message}`);
};

// Uploads a local file and returns its public URL. Re-running replaces the file.
const upload = async (localPath, storagePath) => {
	const body = await readFile(localPath);
	const { error } = await supabase.storage.from(BUCKET).upload(storagePath, body, {
		contentType: "image/png",
		upsert: true,
		cacheControl: "3600",
	});
	fail(error, `Uploading ${storagePath}`);
	return supabase.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl;
};

const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// Saturdays at 16:00 in Lagos (UTC+1, no daylight saving): the `count` before
// today and the `count` from today on
const saturdays = (count, hour = 16) => {
	const now = new Date();
	const lagosToday = new Date(now.getTime() + 60 * 60 * 1000);
	const day = lagosToday.getUTCDay();
	const base = Date.UTC(lagosToday.getUTCFullYear(), lagosToday.getUTCMonth(), lagosToday.getUTCDate() + ((6 - day + 7) % 7));
	const at = (weeks) => new Date(base + weeks * 7 * 864e5 + (hour - 1) * 36e5);
	// this week's Saturday still counts as upcoming until kick-off
	const firstUpcoming = at(0) > now ? 0 : 1;
	return {
		past: Array.from({ length: count }, (_, i) => at(firstUpcoming - count + i)),
		upcoming: Array.from({ length: count }, (_, i) => at(firstUpcoming + i)),
		at: (weeks) => at(firstUpcoming + (weeks > 0 ? weeks - 1 : weeks)),
	};
};

/* ---------- seed ---------- */

const seedTeams = async () => {
	const { data: existing, error } = await supabase.from("teams").select("id, name, crest_url");
	fail(error, "Reading teams");
	const byName = new Map(existing.map((team) => [team.name.toLowerCase(), team]));

	const club = byName.get(CLUB.toLowerCase());
	if (!club) throw new Error(`No "${CLUB}" team found; add it in the admin first`);
	if (!club.crest_url) {
		const crest_url = await upload(repoFile("public/valiant.png"), "teams/valiant-fc.png");
		fail((await supabase.from("teams").update({ crest_url }).eq("id", club.id)).error, "Setting the Valiant FC crest");
		console.log("  Valiant FC crest added");
	}

	let added = 0;
	for (const [name, short_name, image] of TEAMS) {
		if (byName.has(name.toLowerCase())) continue;
		const crest_url = await upload(seedImage(image), `seed/crests/${image}`);
		const { data, error } = await supabase.from("teams").insert({ name, short_name, crest_url }).select("id, name").single();
		fail(error, `Adding ${name}`);
		byName.set(name.toLowerCase(), data);
		added++;
	}
	console.log(`  teams: ${added} added, ${TEAMS.length - added} already there`);
	return (name) => byName.get(name.toLowerCase()).id;
};

const seedMatches = async (teamId) => {
	const seedIds = TEAMS.map(([name]) => teamId(name));
	const { count, error } = await supabase
		.from("matches")
		.select("id", { count: "exact", head: true })
		.or(`home_team.in.(${seedIds}),away_team.in.(${seedIds})`);
	fail(error, "Reading fixtures");
	if (count > 0) {
		console.log(`  fixtures: already seeded (${count} with the sample teams); run "npm run seed:undo" first to start over`);
		return;
	}

	const club = teamId(CLUB);
	const dates = saturdays(RESULTS.length);
	const early = saturdays(RESULTS.length, 13);
	// competition_id and status are written as null, as the app does (server/utils/matches.ts)
	const row = (home_team, away_team, start, home_score = null, away_score = null) => ({
		home_team, away_team, start_time: start.toISOString(), home_score, away_score, competition_id: null, status: null,
	});

	const rows = [
		...RESULTS.map(([opponent, atHome, ours, theirs], i) =>
			atHome
				? row(club, teamId(opponent), dates.past[i], ours, theirs)
				: row(teamId(opponent), club, dates.past[i], theirs, ours),
		),
		...FIXTURES.map(([opponent, atHome], i) =>
			atHome ? row(club, teamId(opponent), dates.upcoming[i]) : row(teamId(opponent), club, dates.upcoming[i]),
		),
		...OTHER_MATCHES.map(([weeks, home, away, homeGoals, awayGoals]) =>
			row(teamId(home), teamId(away), early.at(weeks), homeGoals ?? null, awayGoals ?? null),
		),
	];
	fail((await supabase.from("matches").insert(rows)).error, "Adding fixtures");
	console.log(`  fixtures: ${rows.length} added (${RESULTS.length} Valiant results, ${FIXTURES.length} Valiant fixtures, ${OTHER_MATCHES.length} others)`);
};

const seedSponsors = async () => {
	const { data: existing, error } = await supabase.from("sponsors").select("name, tier, is_active");
	fail(error, "Reading sponsors");
	const names = new Set(existing.map((sponsor) => sponsor.name.toLowerCase()));
	const hasMain = existing.some((sponsor) => sponsor.tier === "main" && sponsor.is_active);

	let added = 0;
	for (const [list, folder] of [[REAL_SPONSORS, "sponsors"], [SEED_SPONSORS, "seed/sponsors"]]) {
		for (const [name, tier, logo, website_url, display_order] of list) {
			if (names.has(name.toLowerCase())) continue;
			// only one main sponsor can be shown; any extra becomes a partner
			const finalTier = tier === "main" && hasMain ? "partner" : tier;
			const logo_url = await upload(seedImage(logo), `${folder}/${slugify(name)}.png`);
			const { error } = await supabase.from("sponsors").insert({ name, tier: finalTier, logo_url, website_url, display_order });
			fail(error, `Adding ${name}`);
			added++;
		}
	}
	console.log(`  sponsors: ${added} added`);
};

const seedProducts = async () => {
	const { data: existing, error } = await supabase.from("products").select("slug");
	fail(error, "Reading products");
	const slugs = new Set(existing.map((product) => product.slug));

	let added = 0;
	for (const product of PRODUCTS) {
		if (slugs.has(product.slug)) continue;
		const image_urls = [];
		for (const image of product.images) image_urls.push(await upload(seedImage(image), `seed/products/${image}`));
		const { data, error } = await supabase
			.from("products")
			.insert({
				slug: product.slug,
				name: product.name,
				description: product.description,
				price_kobo: product.price,
				option_name: "Size",
				image_urls,
				is_active: product.active ?? true,
				is_featured: product.featured,
				display_order: product.order,
			})
			.select("id")
			.single();
		fail(error, `Adding ${product.name}`);
		const variants = product.variants.map((variant) => ({ ...variant, product_id: data.id }));
		fail((await supabase.from("product_variants").insert(variants)).error, `Adding sizes for ${product.name}`);
		added++;
	}
	console.log(`  products: ${added} added, ${PRODUCTS.length - added} already there`);
};

/* ---------- undo ---------- */

const undo = async () => {
	const { data: teams, error } = await supabase.from("teams").select("id, name").in("name", TEAMS.map(([name]) => name));
	fail(error, "Reading teams");
	const ids = teams.map((team) => team.id);
	if (ids.length) {
		const { count, error } = await supabase
			.from("matches")
			.delete({ count: "exact" })
			.or(`home_team.in.(${ids}),away_team.in.(${ids})`);
		fail(error, "Removing fixtures");
		console.log(`  fixtures: ${count} removed`);
		const removed = await supabase.from("teams").delete({ count: "exact" }).in("id", ids);
		fail(removed.error, "Removing teams (are players assigned to them?)");
		console.log(`  teams: ${removed.count} removed`);
	}

	const sponsors = await supabase.from("sponsors").delete({ count: "exact" }).in("name", SEED_SPONSORS.map(([name]) => name));
	fail(sponsors.error, "Removing sponsors");
	console.log(`  sponsors: ${sponsors.count} removed (Island Casino kept)`);

	const products = await supabase.from("products").delete({ count: "exact" }).in("slug", PRODUCTS.map((product) => product.slug));
	fail(products.error, "Removing products (have any been ordered?)");
	console.log(`  products: ${products.count} removed`);

	for (const folder of ["seed/crests", "seed/sponsors", "seed/products"]) {
		const { data: files, error } = await supabase.storage.from(BUCKET).list(folder, { limit: 1000 });
		fail(error, `Listing ${folder}`);
		if (files.length) fail((await supabase.storage.from(BUCKET).remove(files.map((file) => `${folder}/${file.name}`))).error, `Removing ${folder}`);
	}
	console.log("  sample images removed");
};

/* ---------- run ---------- */

try {
	if (process.argv.includes("--undo")) {
		console.log("Removing sample data…");
		await undo();
	} else {
		console.log("Adding sample data…");
		const teamId = await seedTeams();
		await seedMatches(teamId);
		await seedSponsors();
		await seedProducts();
	}
	console.log("Done.");
} catch (error) {
	console.error(`\nStopped: ${error.message}`);
	process.exit(1);
}
