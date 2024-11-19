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

	return startPath;
}

function parseTypeScriptConfig(content: string): GeneratorConfigFileData {
	try {
		const objectMatch = content.match(/config[^{]*=\s*({[\s\S]*?})/);

		if (!objectMatch || !objectMatch[1]) {
			throw new Error("Configuration object not found in file");
		}

		const configString = objectMatch[1];

		try {
			// Convert the matched string to an object
			const parseConfig = new Function(`return ${configString}`)();

			// Validate required fields
			if (
				!parseConfig.pathPattern ||
				typeof parseConfig.pathPattern !== "string"
			) {
				throw new Error(
					"Invalid configuration: pathPattern is required and must be a string",
				);
			}

			if (
				!parseConfig.projectRoot ||
				typeof parseConfig.projectRoot !== "string"
			) {
				throw new Error(
					"Invalid configuration: projectRoot is required and must be a string",
				);
			}

			return parseConfig as GeneratorConfigFileData;
		} catch (evalError) {
			console.error("Debug - Extracted config string:", configString);
			throw new Error(`Error parsing configuration object: ${evalError}`);
		}
	} catch (error) {
		console.error("Debug - Original file content:", content);
		throw error;
	}
}

export async function importConfigFile() {
	try {
		const filename = "serverless-route.config";
		const startPath = process.cwd();
		const projectRoot = findProjectRoot(startPath);

		console.log("Debug - Current working directory:", startPath);
		console.log("Debug - Detected project root:", projectRoot);

		const configFiles = {
			json: path.join(projectRoot, `${filename}.json`),
			js: path.join(projectRoot, `${filename}.js`),
			ts: path.join(projectRoot, `${filename}.ts`),
		};

		console.log("Looking for configuration files in:");
		Object.entries(configFiles).forEach(([type, filePath]) => {
			console.log(
				`- [${type.toUpperCase()}] ${filePath} (${fs.existsSync(filePath) ? "EXISTS" : "NOT FOUND"})`,
			);
		});

		if (fs.existsSync(configFiles.json)) {
			console.log("Using JSON configuration file");
			const data = fs.readFileSync(configFiles.json, "utf-8");
			return JSON.parse(data) as GeneratorConfigFileData;
		}

		if (fs.existsSync(configFiles.js)) {
			console.log("Using JavaScript configuration file");
			const data = await import(configFiles.js);
			return data.default as GeneratorConfigFileData;
		}

		if (fs.existsSync(configFiles.ts)) {
			console.log("Using TypeScript configuration file");
			const content = fs.readFileSync(configFiles.ts, "utf-8");
			return parseTypeScriptConfig(content);
		}

		throw new Error(
			`Configuration file not found. Searched in:\n${Object.entries(configFiles)
				.map(([_, path]) => `- ${path}`)
				.join("\n")}`,
		);
	} catch (error) {
		if (error instanceof Error) {
			console.error("Error details:", error.message);
			console.error("Stack trace:", error.stack);
			throw error;
		}
		throw new Error("Unknown error while importing configuration file");
	}
}
