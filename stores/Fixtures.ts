export const useFixtures = defineStore("fixtures", () => {
	const fixtures = ref<any>([]);
	const result = ref<any>([]);
	const getFixtures = async () => {
		try {
			const { data } = useFetch("/api/get-fixtures");

			fixtures.value = data.value![0];
			result.value = data.value![1];
		} catch (error) {
			console.error(error);
		}
	};

	return { fixtures, result, getFixtures };
});
