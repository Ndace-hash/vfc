import axios from "axios";
import * as cheerio from "cheerio";
import { ref } from "vue";
import type { TeamStat } from "~/types/Team";

export default defineEventHandler(async (event) => {
	const teams = ref<TeamStat[]>([]);
	const { data } = await axios.get(
		"https://thecreativechampionship.com/tccl-table/"
	);
	const $ = cheerio.load(data);

	const $body = $("body");

	const $table = $body.find("table");

	const AllTables = [] as TeamStat[];
	$table.find("tbody tr").each((i, el) => {
		const pos = Number($(el).find("td[data-label=Pos]").text());
		const logo = $(el).find("td[data-label=Club] img").attr("src");
		const name = $(el).find("td[data-label=Club]").text();
		const matchesPlayed = Number($(el).find("td[data-label=P]").text());
		const matchesWon = Number($(el).find("td[data-label=W]").text());
		const matchesDrawn = Number($(el).find("td[data-label=D]").text());
		const matchesLost = Number($(el).find("td[data-label=L]").text());
		const goalScored = Number($(el).find("td[data-label=F]").text());
		const goalAgainst = Number($(el).find("td[data-label=A]").text());
		const goalDifference = Number($(el).find("td[data-label=GD]").text());
		const points = Number($(el).find("td[data-label=Pts]").text());

		AllTables.push({
			pos,
			club: {
				logo,
				name,
			},
			matchesPlayed,
			matchesWon,
			matchesDrawn,
			matchesLost,
			goalScored,
			goalAgainst,
			goalDifference,
			points,
		});
	});
	for (let i = 0; i < 12; i++) {
		teams.value.push(AllTables[i]);
	}

	return teams.value;
});
