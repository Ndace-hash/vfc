<template>
	<footer class="mt-16 border-t border-default bg-muted">
		<div
			class="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 md:grid-cols-[2fr_1fr_1fr] md:gap-16"
		>
			<div class="flex flex-col items-start gap-4">
				<NuxtLink
					to="/"
					class="-ms-1 flex items-center gap-3 rounded-lg p-1 focus-visible:outline-2 focus-visible:outline-primary"
				>
					<img src="/valiant.png" alt="" class="size-14" />
					<span class="text-xl font-bold text-highlighted">{{ CLUB_NAME }}</span>
				</NuxtLink>
				<p class="text-sm text-toned">Lagos, Nigeria</p>
				<ul class="-ms-2.5 flex gap-1" aria-label="Follow us">
					<li v-for="social in SOCIAL_LINKS" :key="social.href">
						<a
							:href="social.href"
							target="_blank"
							rel="noopener"
							:aria-label="`${CLUB_NAME} on ${social.label}`"
							class="grid size-11 place-items-center rounded-full text-toned transition-colors hover:bg-elevated hover:text-primary focus-visible:outline-2 focus-visible:outline-primary motion-reduce:transition-none"
						>
							<UIcon :name="social.icon" class="size-5" />
						</a>
					</li>
				</ul>
			</div>

			<nav aria-labelledby="footer-explore">
				<h2 id="footer-explore" class="text-sm font-semibold text-highlighted">
					Explore
				</h2>
				<ul class="mt-3 flex flex-col">
					<li v-for="link in sitemap" :key="link.to">
						<NuxtLink
							:to="link.to"
							class="inline-flex min-h-10 items-center text-toned hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"
							>{{ link.label }}</NuxtLink
						>
					</li>
				</ul>
			</nav>

			<div>
				<h2 class="text-sm font-semibold text-highlighted">Contact</h2>
				<a
					:href="`mailto:${CONTACT_EMAIL}`"
					class="mt-3 inline-flex min-h-10 items-center break-all text-toned hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"
					>{{ CONTACT_EMAIL }}</a
				>
			</div>
		</div>
		<div class="border-t border-default">
			<p class="mx-auto max-w-6xl px-4 py-5 text-sm text-muted">
				© {{ year }} {{ CLUB_NAME }}. All rights reserved.
			</p>
		</div>
	</footer>
</template>

<script setup lang="ts">
	const sitemap = [
		{ label: "Home", to: "/" },
		...SITE_LINKS,
		{ label: "Become a sponsor", to: "/#sponsors" },
		{ label: "Track an order", to: "/shop/track" },
		{ label: "Shop policies", to: "/shop/policies" },
	];
	const year = new Date().getFullYear();
</script>
