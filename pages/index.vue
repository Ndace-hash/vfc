<template>
	<div>
		<h1 class="sr-only">{{ CLUB_NAME }}</h1>
		<HomeHero />
		<HomeFeaturedProducts />
		<HomeSponsors />
	</div>
</template>

<script setup lang="ts">
	useSeoMeta({
		title: CLUB_NAME,
		description:
			"Results, fixtures, the club shop and sponsors of Valiant FC, a football club from Lagos, Nigeria.",
	});
</script>
