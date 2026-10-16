import { randomUUID } from "node:crypto";

const EXTENSIONS: Record<string, string> = {
	"image/jpeg": "jpg",
	"image/png": "png",
	"image/webp": "webp",
};

// What the file's first bytes say it is, so a renamed file can't pass as an image
const sniffImageType = (data: Buffer) => {
	if (data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff)
		return "image/jpeg";
	if (
		data
			.subarray(0, 8)
			.equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
	)
		return "image/png";
	if (
		data.toString("ascii", 0, 4) === "RIFF" &&
		data.toString("ascii", 8, 12) === "WEBP"
	)
		return "image/webp";
	return null;
};

// Uploads one image to the public `images` bucket and returns its URL.
// Body: a multipart form with `file` and `folder` (one of IMAGE_FOLDERS).
export default defineEventHandler(async (event) => {
	const parts = (await readMultipartFormData(event)) ?? [];
	const file = parts.find((part) => part.name === "file" && part.filename);
	const folder = parts.find((part) => part.name === "folder")?.data.toString();

	if (!file) {
		throw createError({
			statusCode: 400,
			statusMessage: "No image",
			message: "Choose an image to upload",
		});
	}
	if (!IMAGE_FOLDERS.includes(folder as ImageFolder)) {
		throw createError({
			statusCode: 400,
			statusMessage: "Unknown image folder",
		});
	}

	const type = sniffImageType(file.data);
	const problem = type
		? imageFileProblem({ type, size: file.data.length })
		: "Images must be JPEG, PNG or WebP";
	if (problem) {
		throw createError({
			statusCode: 400,
			statusMessage: "Invalid image",
			message: problem,
		});
	}

	// a random name: uploads never overwrite each other, and names don't leak
	const path = `${folder}/${randomUUID()}.${EXTENSIONS[type!]}`;
	const bucket = useSupabaseAdmin().storage.from(IMAGE_BUCKET);
	const { error } = await bucket.upload(path, file.data, {
		contentType: type!,
		// the file at a path never changes, so browsers can keep it for a year
		cacheControl: "31536000",
	});
	failOnSupabaseError(error, "Could not upload the image");
	return { url: bucket.getPublicUrl(path).data.publicUrl };
});
