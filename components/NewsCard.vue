<template>
    <article class="flex my-4 drop-shadow-[4px,4px,9px,0px] overflow-hidden">
        <div class="w-1/2 md:w-1/4">
            <img src="~/assets/images/news-card.jpg" alt="" class="w-full h-full">
        </div>
        <div class="w-1/2 md:w-full ms-3 flex flex-col gap-3 md:gap-4 py-2">
            <p class="font-semibold text-base md:text-lg">Lorem ipsum header</p>
            <p class="max-w-[400px] text-xs md:text-base">Hello what is happening? hyiipoklzik judosjd;lkj jsoioje jzjpodj
                lj zojdml
                jzjoi</p>
            <p class="text-xs">1hr ago</p>
        </div>
    </article>
</template>

<script setup>

</script>

<style lang="scss" scoped>
article {
    border-radius: 8px;
    box-shadow: 4px 4px 9px 0 rgba($color: #000000, $alpha: 0.25);
}
</style>