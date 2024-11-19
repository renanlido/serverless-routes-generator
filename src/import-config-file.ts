import fs from "fs";
import * as path from "path";

export type GeneratorConfigFileData = {
	pathPattern: string;
	projectRoot: string;
	generatedFileName?: string;
	generatedFileExtension?: string;
};

function findProjectRoot(startPath: string): string {
	const rootIndicators = ["package.json", "tsconfig.json", ".git"];
	let currentPath = startPath;

	while (currentPath !== path.parse(currentPath).root) {
		if (
			rootIndicators.some((indicator) =>
				fs.existsSync(path.join(currentPath, indicator)),
			)
		) {
			return currentPath;
		}
		currentPath = path.dirname(currentPath);
	}

	return process.cwd();
}

function parseTypeScriptConfig(content: string): GeneratorConfigFileData {
	try {
		// Enhanced regex to capture different export formats
		const configPatterns = [
			// export const config: Type = { ... }
			/export\s+const\s+config\s*:\s*GeneratorConfigFileData\s*=\s*({[\s\S]*?});/,
			// export const config = { ... }
			/export\s+const\s+config\s*=\s*({[\s\S]*?});/,
			// export default { ... }
			/export\s+default\s*({[\s\S]*?});/,
			// module.exports = { ... }
			/module\.exports\s*=\s*({[\s\S]*?});/,
		];

		let configMatch: RegExpExecArray | null = null;
		let matchedConfig = null;

		// Try each pattern until finding a match
		for (const pattern of configPatterns) {
			configMatch = pattern.exec(content);
			if (configMatch && configMatch[1]) {
				matchedConfig = configMatch[1];
				break;
			}
		}

		if (!matchedConfig) {
			throw new Error("Configuration not found in file");
		}

		// Clean up configuration object
		const normalizedConfig = matchedConfig
			.replace(/[\n\r\t]/g, "")
			.replace(/\s+/g, " ")
			.replace(/,\s*}/g, "}")
			.replace(/\/\*[\s\S]*?\*\//g, "") // Remove multi-line comments
			.replace(/\/\/.*/g, ""); // Remove single line comments

		// Convert string to object
		try {
			// eslint-disable-next-line no-new-func
			const parseConfig = new Function(`return ${normalizedConfig}`)();

			// Basic validation of required fields
			if (!parseConfig.pathPattern || !parseConfig.projectRoot) {
				throw new Error(
					"Invalid configuration: pathPattern and projectRoot are required",
				);
			}

			return parseConfig as GeneratorConfigFileData;
		} catch (evalError) {
			console.error("Error evaluating configuration:", normalizedConfig);
			throw new Error(`Error converting configuration: ${evalError}`);
		}
	} catch (error) {
		console.error("File content:", content);
		throw error;
	}
}

export async function importConfigFile() {
	try {
		const filename = "serverless-route.config";
		const projectRoot = findProjectRoot(process.cwd());

		// Try each file extension in the project root
		const configFileJson = path.join(projectRoot, `${filename}.json`);
		const configFileJs = path.join(projectRoot, `${filename}.js`);
		const configFileTs = path.join(projectRoot, `${filename}.ts`);

		// Debug log
		console.log("Looking for configuration file in:");
		console.log(`- ${configFileJson}`);
		console.log(`- ${configFileJs}`);
		console.log(`- ${configFileTs}`);

		if (fs.existsSync(configFileJson)) {
			console.log("JSON file found");
			const data = fs.readFileSync(configFileJson, "utf-8");
			return JSON.parse(data) as GeneratorConfigFileData;
		}

		if (fs.existsSync(configFileJs)) {
			console.log("JS file found");
			const data = await import(configFileJs);
			return data.default as GeneratorConfigFileData;
		}

		if (fs.existsSync(configFileTs)) {
			console.log("TS file found");
			const content = fs.readFileSync(configFileTs, "utf-8");
			return parseTypeScriptConfig(content);
		}

		throw new Error(
			`Configuration file not found. Searched in:\n` +
				`- ${configFileJson}\n` +
				`- ${configFileJs}\n` +
				`- ${configFileTs}`,
		);
	} catch (error) {
		if (error instanceof Error) {
			console.error("Detailed error:", error.message);
			console.error("Stack:", error.stack);
			throw error;
		}
		throw new Error("Unknown error importing configuration file");
	}
}
