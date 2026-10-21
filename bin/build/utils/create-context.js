//#region src/utils/create-context.ts
function createContext(input) {
	const context = {
		repo: input.repo,
		latestRelease: input.latestRelease || void 0,
		nextRelease: {
			...input.nextRelease,
			tag: null
		}
	};
	Object.defineProperty(context.nextRelease, "tag", { get() {
		return `v${context.nextRelease.version}`;
	} });
	return context;
}

//#endregion
export { createContext };