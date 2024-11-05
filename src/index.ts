import { importConfigFile } from "./import-config-file";
import { generate } from "./route-importer";

export { createHandler } from "./route-decorator";

export const execute = async () => {
	const data = await importConfigFile();

	await generate(data);
};

execute().catch(console.error);
