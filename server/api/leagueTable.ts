import axios from "axios";
import * as cheerio from "cheerio";
import { ref } from "vue";

export default defineEventHandler(async (event) => {
	const teams = ref<any>([]);
	const { data } = await axios.get(
		"https://thecreativechampionship.com/tccl-table/"
	);
	const $ = cheerio.load(data);

	const $body = $("body");

	const $table = $body.find("table");

	const $rows = $table.find("tbody tr").each((i, el) => {
		const pos = $(el).find("td[data-label=Pos]").text();
		const logo = $(el).find("td[data-label=Club] img").attr("src");
		const name = $(el).find("td[data-label=Club]").text();
		const MatchesPlayed = $(el).find("td[data-label=P]").text();
		const MatchesWon = $(el).find("td[data-label=W]").text();
		const MatchesDrawn = $(el).find("td[data-label=D]").text();
		const MatchesLost = $(el).find("td[data-label=L]").text();
		const F = $(el).find("td[data-label=F]").text();
		const A = $(el).find("td[data-label=A]").text();
		const goalDifference = $(el).find("td[data-label=GD]").text();
		const Points = $(el).find("td[data-label=Pts]").text();

		teams.value.push({
			pos,
			club: {
				logo,
				name,
			},
			MatchesPlayed,
			MatchesWon,
			MatchesDrawn,
			MatchesLost,
			F,
			A,
			goalDifference,
			Points,
		});
	});

	return teams.value;
});
