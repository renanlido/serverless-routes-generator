import { importConfigFile } from "./import-config-file";
import { generate } from "./route-importer";
import { lambdaIsRunning } from "./utils/lambda-is-running";

export { createHandler } from "./route-decorator";

export { type GeneratorConfigFileData } from "./import-config-file";

export const execute = async () => {
	if (lambdaIsRunning()) {
		return;
	}

	const data = await importConfigFile();

	await generate(data);
};

execute();
