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
  </main>
</template>

<style lang="scss">
.app {
  @apply w-full max-w-[1240px] mx-auto;

  &-header {
    @apply py-4 justify-center items-center flex flex-col;

    &-logo {
      @apply w-[100px];

      img {
        @apply w-full h-full;
      }
    }

    &-nav {
      @apply bg-primary w-full py-2 flex items-center justify-center;

      .nav-links {
        @apply text-white uppercase flex items-center justify-center gap-16;
      }
    }
  }
}
</style>
