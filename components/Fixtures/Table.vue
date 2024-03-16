<template>
    <section class=" max-w-[900px] mx-auto my-6 flex flex-col items-center">
        <h2 class="uppercase font-bold">Standings</h2>
        <div class="flex items-center justify-center gap-3 my-4">
            <LeagueTable :team-stat="data" />
        </div>
    </section>
</template>

<script setup lang="ts">
const { data } = useFetch<TeamStat[]>('/api/leagueTable')

</script>

<style scoped></style>