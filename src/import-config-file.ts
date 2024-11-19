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
	const maxDepth = 10; // Prevent infinite loop
	let currentPath = startPath;
	let depth = 0;

	while (currentPath !== path.parse(currentPath).root && depth < maxDepth) {
		if (
			rootIndicators.some((indicator) =>
				fs.existsSync(path.join(currentPath, indicator)),
			)
		) {
			return currentPath;
		}
		currentPath = path.dirname(currentPath);
		depth++;
	}

	return startPath; // Return original path if no root indicators found
}

function parseTypeScriptConfig(content: string): GeneratorConfigFileData {
	try {
		// Clean the content first
		const cleanContent = content
			.replace(/\/\*[\s\S]*?\*\//g, "") // Remove multi-line comments
			.replace(/\/\/.*/g, ""); // Remove single line comments

		// Improved regex patterns that handle imports
		const configPatterns = [
			// Pattern for export with type and imports
			/(?:import\s+[^;]+;\s*)?export\s+const\s+config\s*:\s*GeneratorConfigFileData\s*=\s*({[\s\S]*?});/,
			// Pattern for simple export const
			/(?:import\s+[^;]+;\s*)?export\s+const\s+config\s*=\s*({[\s\S]*?});/,
			// Pattern for export default
			/(?:import\s+[^;]+;\s*)?export\s+default\s*({[\s\S]*?});/,
			// Pattern for module.exports
			/(?:import\s+[^;]+;\s*)?module\.exports\s*=\s*({[\s\S]*?});/,
		];

		let configMatch: RegExpExecArray | null = null;
		let matchedConfig = null;

		// Try each pattern until finding a match
		for (const pattern of configPatterns) {
			configMatch = pattern.exec(cleanContent);
			if (configMatch && configMatch[1]) {
				matchedConfig = configMatch[1];
				break;
			}
		}

		if (!matchedConfig) {
			console.error("Debug - Content being parsed:", cleanContent);
			console.error("Debug - No pattern matched the content");
			throw new Error("Configuration object not found in file");
		}

		// Normalize the config object string
		const normalizedConfig = matchedConfig
			.replace(/[\n\r\t]/g, "")
			.replace(/\s+/g, " ")
			.replace(/,\s*}/g, "}");

		// Convert string to object
		try {
			// eslint-disable-next-line no-new-func
			const parseConfig = new Function(`return ${normalizedConfig}`)();

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
			console.error("Debug - Failed to evaluate config:", normalizedConfig);
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
