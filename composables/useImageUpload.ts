// Uploads an image to Supabase Storage through /api/admin/images and
// returns its public URL. Throws with a readable message if the file is not
// an image the bucket accepts.
export const useImageUpload = () => {
	const adminFetch = useAdminFetch();

	return async (file: File, folder: ImageFolder) => {
		const problem = imageFileProblem(file);
		if (problem) throw new Error(problem);

		const body = new FormData();
		body.append("folder", folder);
		body.append("file", file);
		const { url } = await adminFetch<{ url: string }>("/api/admin/images", {
			method: "POST",
			body,
		});
		return url;
	};
};
