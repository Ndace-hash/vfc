<template>
	<PlayerDisplay position="Goalkeepers" :player-list="goalkeepers" />
	<PlayerDisplay position="Defenders" :player-list="defenders" />
	<PlayerDisplay position="Mid Fielders" :player-list="midfielders" />
	<PlayerDisplay position="Forwards" :player-list="forwards" />
</template>

<script setup lang="ts">
	import type { PublicPlayer } from "~/types/Player";

	const { data: players } = useFetch<PublicPlayer[]>("/api/players", {
		default: () => [],
	});

	// positions are stored as codes (CB, LW, ...); each code belongs to one group
	const seperatePlayersByPosition = (group: PlayerPositionGroup) => {
		return computed(() => {
			return players.value.filter(
				(player) => playerPosition(player.position)?.group === group,
			);
		});
	};

	const goalkeepers = seperatePlayersByPosition("Goalkeepers");
	const defenders = seperatePlayersByPosition("Defenders");
	const midfielders = seperatePlayersByPosition("Midfielders");
	const forwards = seperatePlayersByPosition("Forwards");
</script>
