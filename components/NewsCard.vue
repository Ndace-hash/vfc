<template>
    <article class="flex my-4 drop-shadow-[4px,4px,9px,0px] overflow-hidden" @click="viewNews(article.id)">
        <div class="w-1/2 md:w-1/4">
            <img src="~/assets/images/news-card.jpg" alt="" class="w-full h-full">
        </div>
        <div class="w-1/2 md:w-full ms-3 flex flex-col gap-3 md:gap-4 py-2 h-28">
            <p class="font-semibold text-base md:text-lg">{{ article.title }}</p>
            <p class="max-w-[550px] text-xs md:text-base overflow-y-hidden text-wrap min-h-20" v-html="trimedHTML()"
                :style="{ textOverflow: 'ellipsis' }">
            </p>
        </div>
    </article>
</template>

<script setup lang="ts">
import * as cheerio from 'cheerio'
import type { Article } from '~/types/News'
const props = defineProps<{ article: Article }>()
const router = useRouter()
const trimedHTML = () => {
    const $ = cheerio.load(props.article.content)
    return $('p:first').text()

}

const viewNews = (id: string) => {
    router.push({
        path: `/news/${id}`
    })
}
</script>

<style lang="scss" scoped>
article {
    border-radius: 8px;
    box-shadow: 4px 4px 9px 0 rgba($color: #000000, $alpha: 0.25);
}
</style>