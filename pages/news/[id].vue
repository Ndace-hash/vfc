<template>

    <Head>
        <Title>{{ data?.title }} | Valiant FC</Title>
        <Meta name="description" :content="data?.title" />
    </Head>
    <div class="px-4 my-6">
        <h1 class="font-bold uppercase text-primary text-2xl mb-4">{{ data?.title }}</h1>
        <div v-html="data?.content" id="article-content"></div>
    </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { data } = useFetch<{ title: string, content: string, id: string }>(`/api/get-article/${route.params.id}`)
</script>

<style lang="scss">
#article-content {
    p {
        @apply my-2 leading-loose text-base;
    }

    a {
        @apply underline text-primary
    }

    img {
        @apply w-[80%] mx-auto;
    }

    h1 {
        @apply text-2xl;
    }

    h2 {
        @apply text-xl
    }

    li {
        @apply my-2;
    }
}
</style>