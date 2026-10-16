<template>
	<section class="mx-auto max-w-6xl px-4 pt-8 md:pt-12">
		<h1 class="text-3xl font-bold text-highlighted">News</h1>

		<div
			v-if="status === 'pending'"
			class="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
		>
			<USkeleton v-for="n in 6" :key="n" class="h-72 rounded-2xl" />
		</div>

		<p v-else-if="!articles.length" class="mt-6 text-toned">
			No news yet. Check back soon.
		</p>

		<ul v-else class="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			<li v-for="article in articles" :key="article.id">
				<NuxtLink
					:to="`/news/${article.id}`"
					class="group flex h-full flex-col overflow-hidden rounded-2xl bg-default shadow-sm ring-1 ring-default transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-primary motion-reduce:transition-none"
				>
					<img
						v-if="article.bannerUrl"
						:src="article.bannerUrl"
						alt=""
						class="aspect-video w-full bg-elevated object-cover"
						loading="lazy"
					/>
					<div class="flex flex-1 flex-col gap-2 p-5">
						<time
							v-if="article.date"
							:datetime="article.date.toISOString()"
							class="text-sm text-muted"
							>{{ formatDate(article.date) }}</time
						>
						<h2
							class="text-lg font-semibold text-highlighted group-hover:text-primary"
						>
							{{ article.title }}
						</h2>
						<p class="line-clamp-3 text-sm text-toned">{{ article.excerpt }}</p>
					</div>
				</NuxtLink>
			</li>
		</ul>
	</section>
</template>

<script setup lang="ts">
	useSeoMeta({
		title: `News | ${CLUB_NAME}`,
		description: `The latest news from ${CLUB_NAME}.`,
	});

	interface StoredArticle {
		id: string;
		title: string;
		content: string;
		bannerUrl?: string;
		// a Firestore Timestamp, as JSON
		publishedAt?: { seconds: number; nanoseconds: number };
	}

	// newest first, from Firestore
	const { data, status } = useFetch<StoredArticle[]>("/api/get-news", {
		default: () => [],
	});

	// the article's text without its HTML, for the preview; a space after each
	// paragraph, heading or list item so their words don't run together
	const plainText = (html: string) =>
		new DOMParser()
			.parseFromString(
				html.replace(/<\/(p|h[1-6]|li|blockquote)>/gi, "$& "),
				"text/html",
			)
			.body.textContent?.replace(/\s+/g, " ")
			.trim() ?? "";

	const articles = computed(() =>
		(Array.isArray(data.value) ? data.value : []).map((article) => ({
			...article,
			date: article.publishedAt ? timestampToDate(article.publishedAt) : null,
			excerpt: plainText(article.content ?? "").slice(0, 300),
		})),
	);

	const formatDate = (date: Date) =>
		date.toLocaleDateString("en-GB", {
			day: "numeric",
			month: "long",
			year: "numeric",
		});
</script>
