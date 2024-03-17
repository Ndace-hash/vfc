<template>
    <div>
        <FixturesCard :game="game" v-for="game in matches.result" :key="game.id" />
    </div>
</template>

<script setup lang="ts">
const matches = useFixtures()
</script>

<style scoped></style>