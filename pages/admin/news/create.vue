<template>
    <div class="flex items-center justify-center h-screen">
        <TipTap class=" bg-white w-[80%] mx-auto rounded-[8px] py-6 px-8" v-model="content" />
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    layout: 'admin'
})
const content = ref('')
</script>

<style scoped></style>
