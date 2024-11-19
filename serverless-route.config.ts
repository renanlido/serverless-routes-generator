import { GeneratorConfigFileData } from "@renanlido/serverless-routes-generator";

export const config: GeneratorConfigFileData = {
	pathPattern: "src/modules/**/handler.ts",
	projectRoot: "example",
	generatedFileName: "serverless-routes",
	generatedFileExtension: "ts",
};
