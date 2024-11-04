#!/usr/bin/env node

// bin/cli.ts
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { Command } from "commander";
var program = new Command();
program.name("serverless-routes-generator").description("Simplify route creation for Serverless applications").version("1.0.0");
program.command("generate").description("Generate serverless routes").action(() => {
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
program.command("init").description("Cria um arquivo de configura\xE7\xE3o padr\xE3o no diret\xF3rio raiz").action(() => {
  const configContent = `module.exports = {
  pathPattern: "modules/**/handler.ts",
  projectRoot: "example/src",
  generatedFileName: "serverless-route",
};`;
  const configFileName = "serverless-route.config.js";
  const configFilePath = path.resolve(process.cwd(), configFileName);
  if (fs.existsSync(configFilePath)) {
    console.error(`O arquivo "${configFileName}" j\xE1 existe no diret\xF3rio raiz.`);
    process.exit(1);
  }
  fs.writeFile(configFilePath, configContent, "utf8", (err) => {
    if (err) {
      console.error(`Erro ao criar o arquivo de configura\xE7\xE3o: ${err.message}`);
      process.exit(1);
    }
    console.log(`Arquivo de configura\xE7\xE3o "${configFileName}" criado com sucesso no diret\xF3rio raiz.`);
  });
});
program.parse(process.argv);
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
//# sourceMappingURL=cli.mjs.map