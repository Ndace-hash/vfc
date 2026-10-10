<template>
    <section class="my-6">
        <h1 class="text-primary font-bold text-3xl px-4">{{ position }}</h1>
        <div class="flex flex-wrap">
            <PlayerCard v-for="player in playerList" :key="player.id" :player-data="player" />

        </div>


    </section>
</template>

<script setup lang="ts">
import type { PublicPlayer } from '~/types/Player';

defineProps<{ position: string, playerList: PublicPlayer[] }>()
</script>

<style scoped></style>