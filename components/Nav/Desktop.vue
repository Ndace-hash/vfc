<template>
    <header class="app-header">
        <RouterLink to="/">
            <div class="app-header-logo">
                <img src="/valiant.png" alt="Valiant FC logo">
            </div>
        </RouterLink>
        <div class="app-header-nav">
            <nav class="nav-links">
                <RouterLink to="/players">Player</RouterLink>
                <RouterLink to="/">Club</RouterLink>
                <RouterLink to="/">Fixtures</RouterLink>
            </nav>
        </div>
    </header>
</template>

<script setup lang="ts">

</script>

<style scoped lang="scss">
.app-header {
    @apply pt-4 justify-center items-center hidden lg:flex flex-col shadow-md z-50;

    &-logo {
        @apply w-[50px] md:w-[100px];

        img {
            @apply w-full h-full;
        }
    }

    &-nav {
        @apply bg-primary w-full py-2 flex items-center justify-center text-sm md:text-lg;

        .nav-links {
            @apply max-w-[1240px] mx-auto text-white uppercase flex items-center justify-center md:gap-16 gap-6;
        }
    }
}
</style>