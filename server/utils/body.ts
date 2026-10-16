import type { H3Event } from "h3";
import type { z } from "zod";

// Reads the request body and checks it against a schema. Problems become a
// 400 whose message lists what to fix, ready to show in a toast.
export const readBodyAs = async <T extends z.ZodType>(
	event: H3Event,
	schema: T,
	statusMessage: string,
): Promise<z.output<T>> => {
	const result = schema.safeParse(await readBody(event));
	if (!result.success) {
		throw createError({
			statusCode: 400,
			statusMessage,
			message: result.error.issues.map((issue) => issue.message).join(". "),
		});
	}
	return result.data;
};
