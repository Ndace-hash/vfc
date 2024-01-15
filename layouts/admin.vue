<template>
    <main class="flex">
        <section class="bg-admin-dark min-h-screen w-1/5 flex flex-col items-center gap-12 sidebar">
            <div class="flex items-center justify-center w-[150px]">
                <img src="/valiant.png" alt="Valiant FC Logo" class="h-full w-full">
            </div>
            <nav class="flex flex-col gap-6 text-white">
                <RouterLink to="/admin" class="flex items-center justify-start gap-3 ">
                    <IconUser class="" color="#ffffff" width="50px" />
                    <span class="text-white font-bold flex items-center gap-10">Zaccheaus Yisa
                        <IconChevron color="white" width="20px" class="translate-y-[2px]" />
                    </span>
                </RouterLink>
                <RouterLink to="/admin" class="font-bold capitalize">dashboard </RouterLink>
                <RouterLink to="/admin/players" class="font-bold capitalize">players</RouterLink>
                <RouterLink to="/admin/news" class="font-bold capitalize">News</RouterLink>
            </nav>

        </section>
        <section class="bg-admin-light w-full">

            <slot />
        </section>
    </main>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';


</script>

<style scoped lang="scss">
.sidebar {
    box-shadow: 1px 0px 8px 2px #757575;
}
</style>