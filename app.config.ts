export default defineAppConfig({
	ui: {
		// the club green, defined in assets/css/tailwind.css
		colors: { primary: "brand" },
		// form controls were full width in Nuxt UI v2
		input: { slots: { root: "w-full" } },
		inputMenu: { slots: { root: "w-full" } },
		select: { slots: { base: "w-full" } },
	},
});
