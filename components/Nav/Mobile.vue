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
                <RouterLink to="/club">Club</RouterLink>
                <RouterLink to="/fixtures">Fixtures</RouterLink>
            </nav>
        </div>
    </header>
</template>

<script setup lang="ts">

</script>

<style scoped lang="scss">
.app-header {
    @apply justify-center items-center flex lg:hidden shadow-md z-50;

    &-logo {
        @apply w-[50px] md:w-[100px];

        img {
            @apply w-full h-full;
        }
    }

    &-nav {
        @apply bg-primary w-full py-2 flex items-center justify-center text-sm md:text-lg;

        .nav-links {
            @apply text-white uppercase flex items-center justify-center md:gap-16 gap-6;
        }
    }
}
</style>