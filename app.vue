<template>
  <main class="app">

    <header class="app-header">
      <div class="app-header-logo">
        <img src="/valiant.png" alt="Valiant FC logo">
      </div>
      <div class="app-header-nav">
        <nav class="nav-links">
          <RouterLink to="/">Player</RouterLink>
          <RouterLink to="/">Club</RouterLink>
          <RouterLink to="/">Shop</RouterLink>
        </nav>
      </div>
    </header>

    <NuxtPage />
    <footer class="flex justify-center flex-col items-center gap-6 mt-10">

      <div class="flex items-center justify-center gap-6">
        <div class="bg-primary flex items-center justify-center w-[40px] h-[40px] rounded-full overflow-hidden">
          <a href="https://www.instagram.com/valiantfc.ng" target="_blank">
            <div class="w-[20px]">

              <img src="~/assets/images/instagram.png" alt="" class="w-full h-full">
            </div>
          </a>
        </div>
        <div class="bg-primary flex items-center justify-center w-[40px] h-[40px] rounded-full overflow-hidden">
          <a href="https://x.com/valiantFC_ng" target="_blank">
            <div class="w-[20px]">

              <img src="~/assets/images/twitter.png" alt="" class="w-full h-full">
            </div>
          </a>
        </div>
        <div class="bg-primary flex items-center justify-center w-[40px] h-[40px] rounded-full overflow-hidden">
          <a href="https://www.tiktok.com/@valiantfc_ng" target="_blank">
            <div class="w-[20px]">

              <img src="~/assets/images/tiktok.png" alt="" class="w-full h-full">
            </div>
          </a>
        </div>
        <div class="bg-primary flex items-center justify-center w-[40px] h-[40px] rounded-full overflow-hidden">
          <a href="https://facebook.com/Valiantfcng" target="_blank">
            <div class="w-[15px]">

              <img src="~/assets/images/facebook.png" alt="" class="w-full h-full">
            </div>
          </a>
        </div>
      </div>
      <div class="flex items-center justify-center gap-6">
        <RouterLink to="/">Club</RouterLink>
        <RouterLink to="/">Contact us</RouterLink>
        <RouterLink to="/">Shop</RouterLink>
        <RouterLink to="/">Tour</RouterLink>
        <RouterLink to="/">Policy</RouterLink>
      </div>
      <div class="w-[50px]">
        <img src="/valiant.png" alt="" class="w-full h-full">
      </div>
      <div class="flex items-center justify-center bg-primary text-white font-semibold py-2 w-full">
        <p>Valiant FC</p>
      </div>
    </footer>
  </main>
</template>

<script setup>

</script>

<style lang="scss">
.app {
  @apply w-full max-w-[1240px] mx-auto;

  &-header {
    @apply pt-4 justify-center items-center flex flex-col shadow-md z-50;

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
}
</style>
