<template>
    <div class="relative overflow-hidden mx-auto flex h-[300px] md:h-[350px] max-w-[900px] carosel-wrapper"
        :style="{ backgroundImage: `url(${article.bannerUrl})`, backgroundPosition: 'center', backgroundSize: 'contain', backgroundRepeat: 'no-repeat' }"
        @click="viewNews(article.id)">
        <div class="absolute inset-0 bg-[#090808] bg-opacity-40"></div>
        <div class="z-40 flex flex-col text-white px-10 justify-end py-4 gap-4 w-full md:w-2/3">
            <h2 class="capitalize font-bold text-xl md:text-3xl drop-shadow-lg">{{ article.title }}</h2>
            <p class=" text-sm md:text-base drop-shadow-xl overflow-hidden h-12" v-html="trimedHTML()"></p>
            <p class="text-xs md:text-sm drop-shadow-lg font-semibold">{{ article.publishedAt.toDateString() }}</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import * as cheerio from 'cheerio'
import type { Article } from '~/types/News'
import { timestampToDate } from '~/composables/useTimestamp'
const router = useRouter()
const props = defineProps<{ article: Article }>()
const viewNews = (id: string) => {
    router.push({
        path: `/news/${id}`
    })
}
const article = ref({
    ...props.article,
    publishedAt: timestampToDate(props.article.publishedAt)
})
const trimedHTML = () => {
    const $ = cheerio.load(props.article.content)
    return $('p:first').text()

}

</script>

<style lang="scss" scoped>
.carosel-wrapper {
    background-image: url(../assets/images/hero-news.jpg);
    background-position: center;
    background-size: cover;
}
</style>
