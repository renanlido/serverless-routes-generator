import * as path from "path";
import url from "url";

import { globSync } from "glob";

import { GeneratorConfigFileData } from "./import-config-file";
import { ServerlessGenerator } from "./route-generator";
import { lambdaIsRunning } from "./utils/lambda-is-running";

async function importAllHandlers(data: GeneratorConfigFileData) {
	try {
		console.log("Importing all handlers...");

		if (!data || !data.projectRoot || !data.pathPattern) {
			throw new Error("Missing projectRoot or pathPattern in config file");
		}

		const projectRoot = path.join(process.cwd(), data.projectRoot);

		if (!projectRoot) {
			throw new Error("Could not find project root");
		}

		console.log("Project root: ", projectRoot);

		const handlersPath = path.join(
			data.projectRoot.concat("/").concat(data.pathPattern),
		);

		const handlers = globSync(handlersPath);

		for (const handler of handlers) {
			const handlerUrl = url.pathToFileURL(handler).href;
			await import(handlerUrl);
		}
	} catch (error) {
		console.log("Error importing all handlers: ", error);
		throw new Error(error);
	}
}

export async function generate(configFile: GeneratorConfigFileData) {
	try {
		if (lambdaIsRunning()) {
			return;
		}

		await importAllHandlers(configFile);

		const fileName = configFile?.generatedFileName ?? "serverless-routes";

		const projectRoot = process.cwd();
		const srcPath = path.join(projectRoot, configFile.projectRoot);
		const serverlessPath = path.join(
			projectRoot,
			`${fileName}.${configFile?.generatedFileExtension ?? "js"}`,
		);

		const generator = new ServerlessGenerator(
			srcPath,
			serverlessPath,
			configFile,
		);

		generator.generate();

		console.log("Route generation completed successfully!");
		process.exit(0);
	} catch (error) {
		const err = error as Error;

		console.error("Error generating routes: ", err.message);
		console.error(err.stack);
		console.error(JSON.stringify(err, null, 2));
		console.error("Route generation failed!");

		throw err;
	}
}
