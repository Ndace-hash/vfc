<template>
    <div class="max-w-[900px] mx-auto">
        <ContentRenderer v-if="page" :value="page" />
    </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { data: page } = await useAsyncData(route.path, () => {
    return queryCollection('content').path(route.path).first()
})

useSeoMeta({
    title: () => page.value?.title,
    description: () => page.value?.description
})
</script>

<style scoped></style>
