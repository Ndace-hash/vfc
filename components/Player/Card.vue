<template>
    <article class="w-[250px] h-[300px] relative  rounded-[8px] shadow-xl overflow-hidden mx-2 my-4 flex-shrink-0">
        <div class="v-logo-bg absolute inset-0 -z-10">
        </div>
        <span class="absolute -z-10 -right-2 -top-2 text-7xl opacity-50 text-primary">22
        </span>
        <div class="flex w-full h-full flex-col">
            <div class="min-h-3/4 h-4/5 flex items-center justify-center">
                <img src="/assets/images/island-casino.png" alt="" class="w-full h-full" />
            </div>
            <div class="bg-white text-primary font-bold w-full px-2 py-4 justify-self-end">
                <p class="text-lg">Zaccheaus</p>
                <p class="text-3xl">Yisa</p>
            </div>
        </div>
    </article>
</template>

<script setup lang="ts">

</script>

<style scoped lang="scss">
.v-logo-bg {
    background-image: URL('/valiant.png');
    background-size: cover;
    background-position: center;
    transform: translateX(-20%) translateY(-20%) scale(.6);
    opacity: 0.4;
}
</style>