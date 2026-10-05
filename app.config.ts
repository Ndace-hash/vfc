export default defineAppConfig({
	ui: {
		// form controls were full width in Nuxt UI v2
		input: { slots: { root: "w-full" } },
		inputMenu: { slots: { root: "w-full" } },
		select: { slots: { base: "w-full" } },
	},
});
