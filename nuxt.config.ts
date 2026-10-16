// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: "2026-10-05",

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
		"@nuxt/ui",
		"@nuxt/content",
		"@pinia/nuxt",
		"nuxt-security",
	],
	ui: {
		// fonts are loaded from the Google Fonts link above
		fonts: false,
		// the style guide is a white base; without this, devices set to dark mode get dark surfaces
		colorMode: false,
	},
	content: {
		experimental: {
			sqliteConnector: "native",
		},
	},
	security: {
		headers: {
			contentSecurityPolicy: {
				"img-src": ["self", "*", "data:", "blob:"],
				// nuxt-security defaults plus 'wasm-unsafe-eval', which
				// @nuxt/content needs to run its SQLite database in the browser
				"script-src": [
					"'self'",
					"https:",
					"'unsafe-inline'",
					"'strict-dynamic'",
					"'nonce-{{nonce}}'",
					"'wasm-unsafe-eval'",
				],
			},
			crossOriginResourcePolicy: "cross-origin",
			crossOriginEmbedderPolicy: "credentialless",
		},
		corsHandler: {
			origin: "*",
		},
	},
	routeRules: {
		// public form: a handful of enquiries per visitor every 10 minutes is plenty
		"/api/sponsor-enquiries": {
			security: {
				rateLimiter: { tokensPerInterval: 5, interval: 10 * 60 * 1000 },
			},
		},
		// each attempt creates an order and a Paystack payment
		"/api/shop/checkout": {
			security: {
				rateLimiter: { tokensPerInterval: 10, interval: 10 * 60 * 1000 },
			},
		},
		// the confirmation page checks a few times while payment is confirmed
		"/api/shop/orders/**": {
			security: {
				rateLimiter: { tokensPerInterval: 60, interval: 10 * 60 * 1000 },
			},
		},
	},
	css: ["~/assets/css/tailwind.css", "v-calendar/style.css"],
	runtimeConfig: {
		apiKey: "AIzaSyCiKk72rfOWD3gvbFKjGYdbb0uCs4NwW80",
		authDomain: "valiant-fc-dev.firebaseapp.com",
		projectId: "valiant-fc-dev",
		storageBucket: "valiant-fc-dev.appspot.com",
		messagingSenderId: "641701082658",
		appId: "1:641701082658:web:64bd0879e02acc99c6fc7b",
		// service account secrets: filled at runtime from the NUXT_ADMIN_* variables in .env
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
		// server only: bypasses row level security, never move this under `public`
		supabaseSecretKey: process.env.SUPABASE_SECRET_KEY,
		// server only: Paystack's secret key (sk_test_... until the club's account is approved)
		paystackSecretKey: process.env.PAYSTACK_SECRET_KEY,
		public: {
			apiKey: "AIzaSyCiKk72rfOWD3gvbFKjGYdbb0uCs4NwW80",
			authDomain: "valiant-fc-dev.firebaseapp.com",
			projectId: "valiant-fc-dev",
			storageBucket: "valiant-fc-dev.appspot.com",
			messagingSenderId: "641701082658",
			appId: "1:641701082658:web:64bd0879e02acc99c6fc7b",
			supabaseUrl: process.env.SUPABASE_URL,
			supabasePublishableKey: process.env.SUPABASE_PUBLISHABLE_KEY,
		},
	},
	imports: {
		dirs: ["./stores/**"],
	},
	ssr: false,
});
