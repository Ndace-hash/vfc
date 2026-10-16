// Admin image uploads. Checked in the browser before uploading, and again by
// the server route, which also looks at the file's contents.

// the public Supabase Storage bucket, created by supabase/migrations/0001
export const IMAGE_BUCKET = "images";

export const IMAGE_FOLDERS = ["players", "news", "sponsors", "products"] as const;
export type ImageFolder = (typeof IMAGE_FOLDERS)[number];

export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
// for <input type="file" accept="...">
export const IMAGE_ACCEPT = IMAGE_TYPES.join(", ");
// the bucket's own limit
export const IMAGE_MAX_BYTES = 5 * 1024 * 1024;

// Why a file can't be uploaded, or null when it can
export const imageFileProblem = (file: { type: string; size: number }) => {
	if (!IMAGE_TYPES.includes(file.type))
		return "Images must be JPEG, PNG or WebP";
	if (file.size > IMAGE_MAX_BYTES) return "Images must be 5 MB or smaller";
	return null;
};
