<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import LeagueTable from '~/components/LeagueTable.vue';
import type { TeamStat } from '~/types/Team';
const { data } = useFetch<TeamStat[]>('/api/leagueTable')

const route = useRoute()
const { data: news } = await useFetch('/api/get-news')
const localNews = useStorage('news', news.value)
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
      <SwiperSlide v-for="article in news" :key="article.id">
        <CaroselItem :article="article" />
      </SwiperSlide>

    </Swiper>

    <div class="w-full flex items-center justify-center gap-4 mt-4">
      <div class="w-[10px] h-[10px] border-2 border-primary rounded-full bg-primary"></div>
      <div class="w-[10px] h-[10px] border-2 border-primary rounded-full "></div>
      <div class="w-[10px] h-[10px] border-2 border-primary rounded-full "></div>
    </div>
  </section>
  <section class=" max-w-[900px] mx-auto my-6">
    <h2 class="uppercase font-bold">latest updates</h2>
    <NewsCard v-for="article in news" :key="article.id" :article="article" />
  </section>
  <section class=" max-w-[900px] mx-auto my-6">
    <h2 class="uppercase font-bold">latest videos</h2>
    <NewsCard v-for="article in news" :key="article.id" :article="article" />
  </section>
  <section class=" max-w-[900px] mx-auto my-6 flex flex-col items-center">
    <h2 class="uppercase font-bold">Fixtures</h2>
    <MatchFixture />
    <MatchFixture />
    <button class="capitalize text-white bg-primary font-bold py-2 px-6 rounded-[8px] mt-4">view all fixtures</button>
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
