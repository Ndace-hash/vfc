<template>
	<article class="policies mx-auto max-w-3xl px-4 pt-8 md:pt-12">
		<ContentRenderer v-if="page" :value="page" />
		<p class="mt-8 text-toned">
			Contact:
			<a :href="`mailto:${CONTACT_EMAIL}`" class="text-primary hover:underline">{{ CONTACT_EMAIL }}</a>
		</p>
	</article>
</template>

<script setup lang="ts">
	// the text is in content/shop-policies.md, so it can be edited without code
	const { data: page } = await useAsyncData("shop-policies", () =>
		queryCollection("content").path("/shop-policies").first(),
	);

	useSeoMeta({
		title: () => page.value?.title,
		description: () => page.value?.description,
	});
</script>

<style>
	@reference "~/assets/css/tailwind.css";

	.policies {
		h1 {
			@apply text-3xl font-bold text-highlighted;
		}
		h2 {
			@apply mt-10 text-xl font-semibold text-highlighted;
		}
		p {
			@apply mt-3 leading-relaxed text-toned;
		}
		strong {
			@apply text-highlighted;
		}
		blockquote {
			@apply mt-6 rounded-xl bg-amber-50 p-4 ring-1 ring-amber-200;

			p {
				@apply mt-0 text-amber-900;
			}
		}
	}
</style>
