<template>
	<header
		class="sticky top-0 z-40 border-b border-default bg-default/90 backdrop-blur-md"
	>
		<div class="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 md:h-16">
			<NuxtLink
				to="/"
				class="-ms-1 flex items-center gap-2 rounded-lg p-1 focus-visible:outline-2 focus-visible:outline-primary"
			>
				<img src="/valiant.png" alt="" class="size-9 md:size-10" />
				<span class="text-lg font-bold text-highlighted">{{ CLUB_NAME }}</span>
			</NuxtLink>

			<!-- tablets and up: the links sit in the bar -->
			<nav aria-label="Main" class="ms-auto hidden md:block">
				<ul class="flex items-center gap-1">
					<li v-for="link in SITE_LINKS" :key="link.to">
						<NuxtLink
							:to="link.to"
							:aria-current="isActive(link.to) ? 'page' : undefined"
							class="flex min-h-11 items-center rounded-lg px-3 text-[15px] transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-primary"
							:class="
								isActive(link.to)
									? 'font-semibold text-primary'
									: 'font-medium text-toned hover:bg-elevated hover:text-highlighted'
							"
							>{{ link.label }}</NuxtLink
						>
					</li>
				</ul>
			</nav>

			<!-- phones: a menu button opens the links -->
			<button
				type="button"
				class="ms-auto grid size-11 place-items-center rounded-lg text-highlighted hover:bg-elevated focus-visible:outline-2 focus-visible:outline-primary md:hidden"
				aria-label="Open menu"
				:aria-expanded="menuOpen"
				@click="menuOpen = true"
			>
				<UIcon name="i-bi-list" class="size-6" />
			</button>
		</div>

		<USlideover
			v-model:open="menuOpen"
			side="right"
			title="Menu"
			:ui="{ content: 'max-w-xs' }"
		>
			<template #body>
				<nav aria-label="Main">
					<ul class="flex flex-col gap-1">
						<li v-for="link in SITE_LINKS" :key="link.to">
							<NuxtLink
								:to="link.to"
								:aria-current="isActive(link.to) ? 'page' : undefined"
								class="flex min-h-12 items-center rounded-lg px-3 text-lg focus-visible:outline-2 focus-visible:outline-primary"
								:class="
									isActive(link.to)
										? 'bg-primary/10 font-semibold text-brand-700'
										: 'text-highlighted hover:bg-elevated'
								"
								>{{ link.label }}</NuxtLink
							>
						</li>
					</ul>
				</nav>
			</template>
		</USlideover>
	</header>
</template>

<script setup lang="ts">
	const route = useRoute();
	const isActive = (to: string) => route.path.startsWith(to);

	const menuOpen = ref(false);
	watch(
		() => route.fullPath,
		() => {
			menuOpen.value = false;
		},
	);
</script>
