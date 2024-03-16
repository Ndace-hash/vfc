<template>
    <article class="my-4 border border-[#022B2D] py-4 rounded-[8px] px-4">
        <div class="flex flex-col items-center gap-1">
            <p class="text-xs md:text-sm uppercase">{{ NextOrPrev }} Fixture</p>
            <p class="text-primary font-bold text-sm md:text-base">{{ timestampToDate(game.date).toDateString() }}</p>
            <span class="font-bold opacity-65 text-primary text-lg" v-if="!game.played">{{
                timestampToDate(game.date).getUTCHours() }}:{{
                timestampToDate(game.date).getUTCMinutes() }} {{
                (timestampToDate(game.date).getHours() / 12) > 0 ? 'PM' : 'AM' }}</span>
        </div>
        <div class="flex items-center my-4">
            <div class="w-[100px] md:w-[200px] flex flex-col items-center justify-center gap-1 md:gap-0">
                <img :src="game.home.logo" :alt="game.home.name" class="w-full h-full">
                <p class="text-xs md:text-sm">{{ game.home.name }}</p>
            </div>
            <span v-show="game.played" class="font-bold text-2xl">{{ game.goals.home }}</span>
            <p class="uppercase text-lg font-semibold mx-8">vs</p>
            <span v-show="game.played" class="font-bold text-2xl">{{ game.goals.away }}</span>
            <div class="w-[100px] md:w-[200px] flex flex-col items-center justify-center gap-1 md:gap-0">
                <img :src="game.away.logo" :alt="game.away.name" class="w-full h-full">
                <p class="text-xs md:text-sm">{{ game.away.name }}</p>
            </div>
        </div>
    </article>
</template>

<script setup lang="ts">
import { timestampToDate } from '~/composables/useTimestamp'
const props = defineProps<{
    NextOrPrev: string,
    game: any
}>()
</script>

<style lang="scss" scoped>
article {
    box-shadow: 0 6px 7px 0 rgba($color: #000000, $alpha: 0.25);
}
</style>