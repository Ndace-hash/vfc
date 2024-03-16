<template>
    <section class="flex items-center justify-center border-b-2 py-2 gap-6">
        <div class="flex flex-col justify-center">
            <div class="w-[60px]">
                <img :src="game.home.logo" :alt="game.home.name" class="w-full h-full">
            </div>
        </div>
        <div class="flex items-center gap-2 border px-2 py-1 bg-admin-light text-white" v-if="game.played">
            <span class="text-3xl font-bold">{{ game.goals.home }}</span>
            <span class="flex w-min">
                <UIcon name="i-mdi-minus-thick" dynamic />
            </span>
            <span class="text-3xl font-bold">{{ game.goals.away }}</span>
        </div>
        <div class="flex flex-col  items-center border px-2 py-1 bg-admin-light text-white" v-if="!game.played">
            <span class="text-2xl font-bold">{{ timestampToDate(game.date).getHours() }}:{{
                    timestampToDate(game.date).getUTCMinutes() < 10 ? `0${timestampToDate(game.date).getUTCMinutes()}` :
                        `${timestampToDate(game.date).getUTCMinutes()}` }}</span>
                    <span class="text-xs">{{ timestampToDate(game.date).toDateString() }}</span>
        </div>
        <div class="flex flex-col justify-center">
            <div class="w-[60px]">
                <img :src="game.away.logo" :alt="game.away.name" class="w-full h-full">
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import { timestampToDate } from '~/composables/useTimestamp'
const props = defineProps(['game'])
</script>

<style scoped></style>