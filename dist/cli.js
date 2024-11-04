#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
	if ((from && typeof from === "object") || typeof from === "function") {
		for (let key of __getOwnPropNames(from))
			if (!__hasOwnProp.call(to, key) && key !== except)
				__defProp(to, key, {
					get: () => from[key],
					enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable,
				});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (
	(target = mod != null ? __create(__getProtoOf(mod)) : {}),
	__copyProps(
		// If the importer is in node compatibility mode or this is not an ESM
		// file that has been converted to a CommonJS file using a Babel-
		// compatible transform (i.e. "__esModule" has not been set), then set
		// "default" to the CommonJS "module.exports" for node compatibility.
		isNodeMode || !mod || !mod.__esModule
			? __defProp(target, "default", { value: mod, enumerable: true })
			: target,
		mod,
	)
);

// bin/cli.ts
var import_child_process = require("child_process");
var import_fs = __toESM(require("fs"));
var import_path = __toESM(require("path"));
var import_commander = require("commander");
var program = new import_commander.Command();
program
	.name("serverless-routes-generator")
	.description("Simplify route creation for Serverless applications")
	.version("1.0.0");
program
	.command("generate")
	.description("Generate serverless routes")
	.action(() => {
		const scriptPath = import_path.default.resolve(__dirname, "./index.js");
		(0, import_child_process.exec)(
			`npx tsx ${scriptPath}`,
			(error, stdout, stderr) => {
				if (error) {
					console.error(`Erro ao executar o comando: ${error.message}`);
					process.exit(1);
				}
				if (stderr) {
					console.error(`Stderr: ${stderr}`);
					process.exit(1);
				}
				console.log(stdout);
			},
		);
	});
program
	.command("init")
	.description(
		"Cria um arquivo de configura\xE7\xE3o padr\xE3o no diret\xF3rio raiz",
	)
	.action(() => {
		const configContent = `module.exports = {
  pathPattern: "modules/**/handler.ts",
  projectRoot: "example/src",
  generatedFileName: "serverless-route",
};`;
		const configFileName = "serverless-route.config.js";
		const configFilePath = import_path.default.resolve(
			process.cwd(),
			configFileName,
		);
		if (import_fs.default.existsSync(configFilePath)) {
			console.error(
				`O arquivo "${configFileName}" j\xE1 existe no diret\xF3rio raiz.`,
			);
			process.exit(1);
		}
		import_fs.default.writeFile(
			configFilePath,
			configContent,
			"utf8",
			(err) => {
				if (err) {
					console.error(
						`Erro ao criar o arquivo de configura\xE7\xE3o: ${err.message}`,
					);
					process.exit(1);
				}
				console.log(
					`Arquivo de configura\xE7\xE3o "${configFileName}" criado com sucesso no diret\xF3rio raiz.`,
				);
			},
		);
	});
program.parse(process.argv);
if (!process.argv.slice(2).length) {
	program.outputHelp();
}
//# sourceMappingURL=cli.js.map
