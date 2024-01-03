<template>
    <article class="my-4 border border-[#022B2D] py-4 rounded-[8px] px-4">
        <div class="flex flex-col items-center gap-1">
            <p class="text-sm uppercase">Next Match</p>
            <p class="text-primary font-bold text-base">Sunday, 8th October</p>
        </div>
        <div class="flex items-center my-4">
            <div class="w-[200px]">
                <img src="/valiant.png" alt="" class="w-full h-full">
            </div>
            <p class="uppercase text-lg font-semibold mx-8">vs</p>
            <div class="w-[200px]">
                <img src="/valiant.png" alt="" class="w-full h-full">
            </div>
        </div>
    </article>
</template>

<script setup>

</script>

<style lang="scss" scoped>
article {
    box-shadow: 0 6px 7px 0 rgba($color: #000000, $alpha: 0.25);
}
</style>