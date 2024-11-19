import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { Command } from "commander";

const program = new Command();

type ConfigFileType = "js" | "ts" | "json";

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

function generateConfigContent(type: ConfigFileType): string {
	const configObjectTs = {
		pathPattern: "src/modules/**/handler.ts",
		projectRoot: "example",
		generatedFileName: "serverless-routes",
		generatedFileExtension: type === "json" ? "ts" : type,
	};

	const configObjectJs = {
		pathPattern: "src/modules/**/handler.js",
		projectRoot: "example",
		generatedFileName: "serverless-routes",
		generatedFileExtension: type,
	};

	switch (type) {
		case "js":
			return `module.exports = ${JSON.stringify(configObjectJs, null, 2)};`;
		case "ts":
			return `import { GeneratorConfigFileData } from '@renanlido/serverless-routes-generator';
\n\nexport const config: GeneratorConfigFileData = ${JSON.stringify(configObjectTs, null, 2)};`;
		case "json":
			return JSON.stringify(configObjectTs, null, 2);
		default:
			throw new Error(`Tipo de arquivo não suportado: ${type}`);
	}
}

function getConfigFilename(type: ConfigFileType): string {
	return `serverless-route.config.${type}`;
}

program
	.name("serverless-routes-generator")
	.description("Simplify route creation for Serverless applications")
	.version("1.0.1");

program
	.command("generate")
	.description("Generate serverless routes")
	.action(() => {
		const scriptPath = path.resolve(__dirname, "./index.js");

		exec(`npx tsx ${scriptPath}`, (error, stdout, stderr) => {
			if (error) {
				console.error(`Error on execute command: ${error.message}`);
				process.exit(1);
			}
			if (stderr) {
				console.error(`Stderr: ${stderr}`);
				process.exit(1);
			}
			console.log(stdout);
		});
	});

program
	.command("init")
	.description("Create an initial configuration file on the project root")
	.option(
		"-t, --type <type>",
		"Tipo do arquivo de configuração (js, ts, ou json)",
		"ts",
	)
	.action((options) => {
		const fileType = options.type.toLowerCase() as ConfigFileType;

		if (!["js", "ts", "json"].includes(fileType)) {
			console.error("Invalid file type. Use js, ts, or json");
			process.exit(1);
		}

		const projectRoot = findProjectRoot(process.cwd());
		const filename = getConfigFilename(fileType);
		const configPath = path.join(projectRoot, filename);

		const existingConfigs = ["js", "ts", "json"].map((ext) =>
			path.join(projectRoot, `serverless-route.config.${ext}`),
		);

		if (existingConfigs.some((file) => fs.existsSync(file))) {
			const existingFiles = existingConfigs
				.filter((file) => fs.existsSync(file))
				.map((file) => path.basename(file))
				.join(", ");

			console.error(`Already existing configuration files: ${existingFiles}`);
			process.exit(1);
		}

		try {
			const configContent = generateConfigContent(fileType);

			fs.writeFileSync(configPath, configContent, "utf8");

			console.log(
				`✅ Configuration file "${filename}" success created:\n${configPath}`,
			);
		} catch (error) {
			console.error(
				"Error on create configuration file:",
				error instanceof Error ? error.message : error,
			);
			process.exit(1);
		}
	});

program.parse(process.argv);

if (!process.argv.slice(2).length) {
	program.outputHelp();
}
