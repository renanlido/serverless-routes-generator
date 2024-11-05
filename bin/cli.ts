import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { Command } from "commander";

const program = new Command();

program
	.name("serverless-routes-generator")
	.description("Simplify route creation for Serverless applications")
	.version("1.0.0");

program
	.command("generate")
	.description("Generate serverless routes")
	.action(() => {
		const scriptPath = path.resolve(__dirname, "./index.js");

		exec(`npx tsx ${scriptPath}`, (error, stdout, stderr) => {
			if (error) {
				console.error(`Erro ao executar o comando: ${error.message}`);
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
	.description("Cria um arquivo de configuração padrão no diretório raiz")
	.action(() => {
		const configContent = `module.exports = {
  pathPattern: "modules/**/handler.ts",
  projectRoot: "example/src",
  generatedFileName: "serverless-routes",
};`;

		const configFileName = "serverless-routes.config.js";

		const configFilePath = path.resolve(process.cwd(), configFileName);

		if (fs.existsSync(configFilePath)) {
			console.error(
				`O arquivo "${configFileName}" já existe no diretório raiz.`,
			);
			process.exit(1);
		}

		fs.writeFile(configFilePath, configContent, "utf8", (err) => {
			if (err) {
				console.error(
					`Erro ao criar o arquivo de configuração: ${err.message}`,
				);
				process.exit(1);
			}
			console.log(
				`Arquivo de configuração "${configFileName}" criado com sucesso no diretório raiz.`,
			);
		});
	});

program.parse(process.argv);

// If no arguments are provided, display help
if (!process.argv.slice(2).length) {
	program.outputHelp();
}
