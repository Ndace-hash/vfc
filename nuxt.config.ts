// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	devtools: {
		enabled: true,

		timeline: {
			enabled: true,
		},
	},

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
	modules: ["@nuxt/content", "nuxt-swiper", "@nuxt/ui", "@pinia/nuxt"],
	tailwindcss: {
		configPath: "./tailwind.config.js",
	},
	css: ["v-calendar/style.css"],
	runtimeConfig: {
		apiKey: process.env.API_KEY,
		authDomain: process.env.AUTH_DOMAIN,
		projectId: process.env.PROJECT_ID,
		storageBucket: process.env.STORAGE_BUCKET,
		messagingSenderId: process.env.MESSAGING_SENDER_ID,
		appId: process.env.APP_ID,
	},
	imports: {
		dirs: ["./stores/**"],
	},
	ssr: false,
});
