export const SHEET_FILE_TYPES = ".csv,.xlsx";

// Reads a .csv or .xlsx file into rows of cells, header row first.
// The parsers are loaded on demand so they stay out of the main bundle.
export const readSheetFile = async (file: File): Promise<unknown[][]> => {
	const extension = file.name.split(".").pop()?.toLowerCase();

	if (extension === "csv") {
		const { default: Papa } = await import("papaparse");
		// blank lines are kept so row numbers match what the spreadsheet shows
		const { data, errors } = Papa.parse<string[]>(await file.text());
		if (!data.length && errors.length) throw new Error(errors[0]!.message);
		return data;
	}

	if (extension === "xlsx") {
		// this build parses on the main thread instead of spawning a web worker,
		// which is plenty for a squad list and needs no content security policy change
		const { readSheet } = await import("read-excel-file/web-worker");
		return readSheet(file);
	}

	throw new Error("Unsupported file. Choose a .csv or .xlsx file");
};
