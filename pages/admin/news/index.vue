<template>
    <section>
        <h1 class="text-white capitalize text-2xl max-w-[1024px] mx-auto my-6">News <span
                class="font-semibold">Updates</span></h1>
        <div class="bg-white max-w-[1024px] h-full max-h-[600px] mx-auto rounded-[8px] shadow-lg my-10 overflow-y-hidden">
            <div class="flex items-center py-4 px-4 justify-between border-b border-admin-light">
                <NuxtLink to="/admin/news/create"
                    class="flex bg-primary text-white border-2 border-primary items-center justify-center gap-1   font-semibold py-2 px-4 rounded-full md:hover:shadow-md duration-200 ease-in ">
                    <span>Create</span>
                    <IconPlus width="30px" color="#ffffff" />
                </NuxtLink>
                <div class="flex gap-2 items-center">
                    <UButton
                        class="bg-transparent text-admin-dark flex items-center border-2 border-primary hover:text-white">
                        <IconRefresh width="15px" />
                        Refresh
                    </UButton>
                    <UInput placeholder="filter news..." />
                </div>
            </div>

        </div>

    </section>
</template>

<script setup lang="ts">
definePageMeta({
    layout: 'admin'
})
</script>

<style scoped></style>