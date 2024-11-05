import fs from "fs";
import * as path from "path";

export type GeneratorConfigFileData = {
	pathPattern: string;
	projectRoot: string;
	generatedFileName?: string;
	generatedFileExtension?: string;
};

export async function importConfigFile() {
	try {
		const filename = "serverless-route.config";

		const configFileJson = path.join(process.cwd(), `${filename}.json`);

		if (fs.existsSync(configFileJson)) {
			const data = fs.readFileSync(configFileJson, "utf-8");

			const parse = JSON.parse(data) as GeneratorConfigFileData;

			return parse;
		}

		const configFileJs = path.join(process.cwd(), `${filename}.js`);

		if (fs.existsSync(configFileJs)) {
			const data = await import(configFileJs);

			const configData = data.default as GeneratorConfigFileData;

			return configData;
		}

		const configFileTs = path.join(process.cwd(), `${filename}.ts`);
		if (fs.existsSync(configFileTs)) {
			const { config } = await import(configFileTs);

			const configData = config as GeneratorConfigFileData;

			return configData;
		}

		throw new Error(
			`Could not find config file at ${configFileJson} or ${configFileJs} or ${configFileTs}`,
		);
	} catch (error) {
		const err = error as Error;

		console.error(err.message);
		process.exit(1);
	}
}
