<template>
    <div class="relative overflow-hidden mx-auto flex h-[300px] md:h-[350px] max-w-[900px] carosel-wrapper">
        <div class="absolute inset-0 bg-[#090808] bg-opacity-40"></div>
        <div class="z-40 flex flex-col text-white px-10 justify-end py-4 gap-4 w-full md:w-2/3">
            <h2 class="capitalize font-bold text-xl md:text-3xl drop-shadow-lg">Headline of the day</h2>
            <p class=" text-sm md:text-base drop-shadow-xl">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Fugit
                illum nobis
                obcaecati porro?
                Velit ex cum
                perspiciatis deserunt dicta quis.</p>
            <p class="text-xs md:text-sm drop-shadow-lg">1h ago</p>
        </div>
    </div>
</template>

<script setup>

</script>

<style lang="scss" scoped>
.carosel-wrapper {
    background-image: url(../assets/images/hero-news.jpg);
    background-position: center;
    background-size: cover;
}
</style>
