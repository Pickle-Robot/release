//#region src/utils/format-date.ts
function formatDate(date) {
	return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
}

//#endregion
export { formatDate };