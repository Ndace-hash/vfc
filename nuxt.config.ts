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
	modules: [
		"@nuxt/content",
		"nuxt-swiper",
		"@nuxt/ui",
		"@pinia/nuxt",
		"nuxt-security",
	],
	tailwindcss: {
		configPath: "./tailwind.config.js",
	},
	security: {
		headers: {
			contentSecurityPolicy: {
				"img-src": ["self", "*", "data:", "blob:"],
			},
			crossOriginResourcePolicy: "cross-origin",
			crossOriginEmbedderPolicy: "credentialless",
		},
		corsHandler: {
			origin: "*",
		},
	},
	css: ["v-calendar/style.css"],
	runtimeConfig: {
		apiKey: "",
		authDomain: "",
		projectId: "",
		storageBucket: "",
		messagingSenderId: "",
		appId: "",
		adminType: "",
		adminProjectId: "",
		adminPrivateKeyId: "",
		adminPrivateKey: "",
		adminClientEmail: "",
		adminClientId: "",
		adminAuthUrl: "",
		adminTokenUrl: "",
		adminAuthProviderCertUrl:
			process.env.NUXT_ADMIN_AUTH_PROVIDER_X509_CERT_URL,
		adminClientCertUrl: process.env.NUXT_ADMIN_CLIENT_X509_CERT_URL,
		adminUniverseDomain: "",
		public: {
			apiKey: "",
			authDomain: "",
			projectId: "",
			storageBucket: "",
			messagingSenderId: "",
			appId: "",
		},
	},
	imports: {
		dirs: ["./stores/**"],
	},
	ssr: false,
});
