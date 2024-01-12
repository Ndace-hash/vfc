// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	devtools: { enabled: true },

	app: {
		head: {
			link: [
				{ href: "/valiant.png", rel: "icon" },
				{ rel: "preconnect", href: "https://fonts.googleapis.com" },
				{
					rel: "preconnect",
					href: "https://fonts.gstatic.com",
					crossorigin: "",
				},
				{
					href: "https://fonts.googleapis.com/css2?family=Inter:wght@200;400;700;800&family=Smooch+Sans:wght@100;300;400;700&display=swap",
					rel: "stylesheet",
				},
			],
			title: "Valiant FC",
		},
	},
	modules: ["@nuxtjs/tailwindcss", "@nuxt/content", "nuxt-swiper", "@nuxt/ui"],
	tailwindcss: {
		configPath: "./tailwind.config.js",
	},
});
