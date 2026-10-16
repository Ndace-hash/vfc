<template>
	<section
		id="sponsors"
		aria-labelledby="sponsors-heading"
		class="mx-auto max-w-6xl scroll-mt-20 px-4 pt-16"
	>
		<template v-if="main || partners.length">
			<h2
				id="sponsors-heading"
				class="text-2xl font-bold text-highlighted md:text-3xl"
			>
				Our sponsors
			</h2>
			<p class="mt-2 max-w-2xl text-toned">
				The partners who back {{ CLUB_NAME }} and grassroots football in Lagos.
			</p>

			<component
				:is="main.website_url ? 'a' : 'div'"
				v-if="main"
				v-bind="linkAttrs(main)"
				class="mt-6 flex flex-col items-center gap-3 rounded-2xl bg-default px-6 py-8 shadow-sm ring-1 ring-default transition-shadow motion-reduce:transition-none"
				:class="main.website_url ? 'hover:shadow-md focus-visible:outline-2 focus-visible:outline-primary' : ''"
			>
				<span class="text-xs font-semibold uppercase tracking-wide text-muted"
					>Main sponsor</span
				>
				<img
					v-if="main.logo_url"
					:src="main.logo_url"
					:alt="main.name"
					class="h-20 max-w-full object-contain md:h-28"
				/>
				<span v-else class="text-2xl font-bold text-highlighted">{{
					main.name
				}}</span>
			</component>

			<ul
				v-if="partners.length"
				class="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4"
				aria-label="Partners"
			>
				<li v-for="partner in partners" :key="partner.id">
					<component
						:is="partner.website_url ? 'a' : 'div'"
						v-bind="linkAttrs(partner)"
						class="flex h-24 items-center justify-center rounded-xl bg-default p-4 shadow-sm ring-1 ring-default transition-shadow motion-reduce:transition-none"
						:class="partner.website_url ? 'hover:shadow-md focus-visible:outline-2 focus-visible:outline-primary' : ''"
					>
						<img
							v-if="partner.logo_url"
							:src="partner.logo_url"
							:alt="partner.name"
							class="max-h-full max-w-full object-contain"
						/>
						<span v-else class="text-center font-semibold text-highlighted">{{
							partner.name
						}}</span>
					</component>
				</li>
			</ul>
		</template>

		<div
			class="flex flex-col gap-5 rounded-2xl bg-primary/5 p-6 ring-1 ring-primary/15 md:flex-row md:items-center md:justify-between md:p-8"
			:class="main || partners.length ? 'mt-8' : ''"
		>
			<div class="max-w-xl">
				<component
					:is="main || partners.length ? 'h3' : 'h2'"
					:id="main || partners.length ? undefined : 'sponsors-heading'"
					class="text-xl font-bold text-highlighted md:text-2xl"
				>
					Become a sponsor
				</component>
				<p class="mt-2 text-toned">
					Put your brand in front of {{ CLUB_NAME }}’s supporters and help give
					Lagos’s young players a stage.
				</p>
			</div>
			<div class="flex shrink-0 flex-wrap items-center gap-2">
				<UButton size="lg" class="px-6" @click="enquiryOpen = true"
					>Become a sponsor</UButton
				>
				<UButton to="/club" size="lg" color="neutral" variant="ghost"
					>Learn about the club</UButton
				>
			</div>
		</div>

		<UModal
			v-model:open="enquiryOpen"
			title="Become a sponsor"
			description="Tell us a little about your business and we’ll get back to you."
			:ui="{ title: 'text-xl font-bold text-highlighted' }"
		>
			<template #body>
				<HomeSponsorEnquiryForm @done="enquiryOpen = false" />
			</template>
		</UModal>
	</section>
</template>

<script setup lang="ts">
	import type { PublicSponsor } from "~/types/Sponsor";

	// a failed load just leaves the sponsor list out; the call to action stays
	const { data: sponsors } = useFetch<PublicSponsor[]>("/api/sponsors", {
		default: () => [],
	});

	const main = computed(() => sponsors.value.find((s) => s.tier === "main"));
	const partners = computed(() =>
		sponsors.value.filter((s) => s.tier === "partner"),
	);

	const linkAttrs = (sponsor: PublicSponsor) =>
		sponsor.website_url
			? {
					href: sponsor.website_url,
					target: "_blank",
					// "sponsored" tells search engines this is a paid link
					rel: "sponsored noopener",
					"aria-label": `${sponsor.name} (opens their website)`,
				}
			: {};

	const enquiryOpen = ref(false);
</script>
