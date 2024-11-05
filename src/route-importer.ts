import * as path from "path";
import url from "url";

import { globSync } from "glob";

import { GeneratorConfigFileData } from "./import-config-file";
import { ServerlessGenerator } from "./route-generator";

async function importAllHandlers(data: GeneratorConfigFileData) {
	const handlersPath = path.join(
		process.cwd(),
		`${data.projectRoot.concat("/").concat(data.pathPattern)}`,
	);

	const handlers = globSync(handlersPath);

	for (const handler of handlers) {
		try {
			const handlerUrl = url.pathToFileURL(handler).href;
			await import(handlerUrl);
		} catch (error) {
			console.warn(`Warning: Could not import handler at ${handler}`, error);
		}
	}
}

export async function generate(configFile: GeneratorConfigFileData) {
	try {
		await importAllHandlers(configFile);

		const fileName = configFile?.generatedFileName ?? "serverless-routes";

		const projectRoot = process.cwd();
		const srcPath = path.join(projectRoot, configFile.projectRoot);
		const serverlessPath = path.join(projectRoot, `${fileName}.js`);

		const generator = new ServerlessGenerator(
			srcPath,
			serverlessPath,
			configFile,
		);

		generator.generate();

		console.log("Route generation completed successfully!");
	} catch (error) {
		console.error("Error generating routes:", error);
		process.exit(1);
	}
}
