/** @type {import("prettier").Config} */
export default {
	useTabs: true,
	tabWidth: 2,
	vueIndentScriptAndStyle: true,
	// files are checked out with CRLF on Windows (core.autocrlf); keep whatever a file already uses
	endOfLine: "auto",
};
