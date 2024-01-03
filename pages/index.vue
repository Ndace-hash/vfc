<script setup lang="ts">
const route = useRoute()
</script>

<template>
  <section class="w-full mx-auto ">
    <CaroselItem />
    <div class="w-full flex items-center justify-center gap-4 mt-4">
      <div class="w-[10px] h-[10px] border-2 border-primary rounded-full bg-primary"></div>
      <div class="w-[10px] h-[10px] border-2 border-primary rounded-full "></div>
      <div class="w-[10px] h-[10px] border-2 border-primary rounded-full "></div>
    </div>
  </section>
  <section class=" max-w-[900px] mx-auto my-6">
    <h2 class="uppercase font-bold">latest updates</h2>
    <NewsCard />
    <NewsCard />
  </section>
  <section class=" max-w-[900px] mx-auto my-6">
    <h2 class="uppercase font-bold">latest videos</h2>
    <NewsCard />
    <NewsCard />
  </section>
  <section class=" max-w-[900px] mx-auto my-6 flex flex-col items-center">
    <h2 class="uppercase font-bold">Fixtures</h2>
  </section>
</template>
