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
	const cleaned = content.trim();

	const configMatch = cleaned.match(
		/export\s+const\s+config\s*:\s*GeneratorConfigFileData\s*=\s*({[\s\S]*?});/,
	);

	if (!configMatch || !configMatch[1]) {
		throw new Error("Formato de configuração TypeScript inválido");
	}

	const configString = configMatch[1];

	const normalizedConfig = configString
		.replace(/[\n\r\t]/g, "")
		.replace(/\s+/g, " ")
		.replace(/,\s*}/g, "}");

	try {
		const parseConfig = new Function(`return ${normalizedConfig}`)();
		return parseConfig as GeneratorConfigFileData;
	} catch (error) {
		throw new Error(`Erro ao converter configuração: ${error}`);
	}
}

export async function importConfigFile() {
	try {
		const filename = "serverless-route.config";
		const projectRoot = findProjectRoot(process.cwd());

		const configFileJson = path.join(projectRoot, `${filename}.json`);
		const configFileJs = path.join(projectRoot, `${filename}.js`);
		const configFileTs = path.join(projectRoot, `${filename}.ts`);

		if (fs.existsSync(configFileJson)) {
			const data = fs.readFileSync(configFileJson, "utf-8");
			return JSON.parse(data) as GeneratorConfigFileData;
		}

		if (fs.existsSync(configFileJs)) {
			const data = await import(configFileJs);
			return data.default as GeneratorConfigFileData;
		}

		if (fs.existsSync(configFileTs)) {
			const content = fs.readFileSync(configFileTs, "utf-8");
			return parseTypeScriptConfig(content);
		}

		throw new Error(
			`Arquivo de configuração não encontrado. Procurado em:\n` +
				`- ${configFileJson}\n` +
				`- ${configFileJs}\n` +
				`- ${configFileTs}`,
		);
	} catch (error) {
		if (error instanceof Error) {
			throw error;
		}
		throw new Error("Erro desconhecido ao importar arquivo de configuração");
	}
}
