// Published products with their available sizes. ?featured=1 for the home page.
export default defineEventHandler((event) => {
	const { featured } = getQuery(event);
	return fetchPublicProducts({ featured: featured === "1" || featured === "true" });
});
