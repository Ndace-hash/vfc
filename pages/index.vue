<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import LeagueTable from '~/components/LeagueTable.vue';
import type { Article } from '~/types/News';
import type { TeamStat } from '~/types/Team';
const { data } = useFetch<TeamStat[]>('/api/leagueTable')

const { data: news } = await useFetch('/api/get-news')
const Headlines = news.value.filter((_article: Article, i: number) => i < 3)
const firstNews = news.value.filter((_article: Article, i: number) => i >= 3 && i < 8)
const secondNews = news.value.filter((_article: Article, i: number) => i >= 8 && i < 15)

const { data: fixtures } = await useFetch('/api/get-fixtures')
const futureGames = fixtures.value[0]
const pastGames = fixtures.value[1]


</script>

<template>
  <section class="w-full mx-auto overflow-hidden max-w-[900px]">
    <Swiper :modules="[SwiperAutoplay, SwiperEffectCreative]" :slides-per-view="1" :speed="4000" :loop="true"
      :effect="'creative'" :autoplay="{
      delay: 3000,
      disableOnInteraction: true
    }" :creative-effect="{
      prev: {
        shadow: true,
        translate: ['-100%', 0, -1],
      },
      next: {
        translate: ['100%', 0, 0],
      },
    }">
      <SwiperSlide v-for="article in Headlines" :key="article.id">
        <CaroselItem :article="article" />
      </SwiperSlide>

    </Swiper>

  </section>
  <section class=" max-w-[900px] mx-auto my-6">
    <NewsCard v-for="article in firstNews" :key="article.id" :article="article" />
  </section>
  <section class=" max-w-[900px] mx-auto my-6 flex flex-col items-center">
    <h2 class="uppercase font-bold">Fixtures</h2>
    <MatchFixture NextOrPrev="Next" :game="futureGames[0]" />
    <MatchFixture NextOrPrev="Last" :game="pastGames[0]" />
    <button class="capitalize text-white bg-primary font-bold py-2 px-6 rounded-[8px] mt-4">view all fixtures</button>
  </section>
  <section class=" max-w-[900px] mx-auto my-6">
    <NewsCard v-for="article in secondNews" :key="article.id" :article="article" />
  </section>
  <section class=" max-w-[900px] mx-auto my-6 flex flex-col items-center">
    <h2 class="uppercase font-bold">Sponsors</h2>
    <div class="flex items-center justify-center gap-3 my-4">
      <div class="w-[200px] border-2 border-primary rounded-[8px] p-2">
        <img src="~/assets/images/island-casino.png" alt="" class="w-full h-full">
      </div>
    </div>
  </section>
  <section class=" max-w-[900px] mx-auto my-6 flex flex-col items-center">
    <h2 class="uppercase font-bold">Standings</h2>
    <div class="flex items-center justify-center gap-3 my-4">
      <LeagueTable :team-stat="data" />
    </div>
  </section>
</template>
