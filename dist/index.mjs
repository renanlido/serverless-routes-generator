var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) =>
	key in obj
		? __defProp(obj, key, {
				enumerable: true,
				configurable: true,
				writable: true,
				value,
			})
		: (obj[key] = value);
var __name = (target, value) =>
	__defProp(target, "name", { value, configurable: true });
var __publicField = (obj, key, value) =>
	__defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// src/index.ts
import fs2 from "fs";
import * as path4 from "path";

// src/route-importer.ts
import * as path3 from "path";
import url from "url";
import { globSync } from "glob";

// src/route-generator.ts
import * as fs from "fs";
import * as path2 from "path";

// src/route-decorator.ts
import path from "path";
var routeConfigs = /* @__PURE__ */ new Map();
function getContext(match) {
	if (match && match[1]) {
		const caminhoCompleto = match[1];
		const diretorio = path.dirname(caminhoCompleto);
		const indiceSrc = diretorio.indexOf(path.join("src"));
		if (indiceSrc !== -1) {
			const caminhoRelativo = diretorio.substring(indiceSrc);
			return caminhoRelativo;
		}
	}
	return null;
}
__name(getContext, "getContext");
var createHandler = /* @__PURE__ */ __name((config, handler) => {
	if (process.env.NODE_ENV === "production") {
		return handler;
	}
	const matchPath = new Error().stack
		.split("\n")[2]
		.match(/\(([^:]+):\d+:\d+\)/);
	if (!matchPath) {
		throw new Error("Could not find handler path");
	}
	const context = getContext(matchPath);
	if (!context) {
		throw new Error("Could not find handler context");
	}
	const fileName =
		new Error().stack.split("\n")[2].match(/[/\\]([\w\-. ]+)\.[jt]s/)?.[1] ||
		"unknown";
	const key = `${fileName}.${config.name}`;
	routeConfigs.set(key, {
		...config,
		context,
	});
	return handler;
}, "createHandler");
var getRouteConfigs = /* @__PURE__ */ __name(() => {
	return Array.from(routeConfigs.entries()).map(([handler, config]) => ({
		handler,
		...config,
	}));
}, "getRouteConfigs");

// src/route-generator.ts
var _ServerlessGenerator = class _ServerlessGenerator {
	constructor(basePath, outputPath) {
		__publicField(this, "basePath");
		__publicField(this, "outputPath");
		this.basePath = basePath;
		this.outputPath = outputPath;
	}
	generateServerlessConfig() {
		const routes = getRouteConfigs();
		const functions = {};
		routes.forEach((route) => {
			const functionName = route.name || route.path.replace(/\//g, "-");
			const handlerPath = path2.relative(
				this.basePath,
				path2.join(this.basePath, route.context, route.handler),
			);
			functions[functionName] = {
				handler: handlerPath,
				events: [
					{
						http: {
							cors: route.cors ?? true,
							method: route.method,
							path: route.path,
						},
					},
				],
			};
		});
		return `
    module.exports = {
      functions: ${JSON.stringify(functions, null, 2)}
    };`;
	}
	generate() {
		const config = this.generateServerlessConfig();
		fs.writeFileSync(this.outputPath, config);
		console.log(`Serverless config generated at ${this.outputPath}`);
	}
};
__name(_ServerlessGenerator, "ServerlessGenerator");
var ServerlessGenerator = _ServerlessGenerator;

// src/route-importer.ts
async function importAllHandlers(data) {
	const handlersPath = path3.join(
		process.cwd(),
		`${data.projectRoot.concat("/").concat(data.pathPattern)}`,
	);
	const handlers = globSync(handlersPath);
	for (const handler of handlers) {
		try {
			const handlerUrl = url.pathToFileURL(handler).href;
			await import(handlerUrl);
		} catch (error) {
			console.warn(`Warning: Could not import handler at ${handler}`, error);
		}
	}
}
__name(importAllHandlers, "importAllHandlers");
async function generate(data) {
	try {
		await importAllHandlers(data);
		const fileName = data?.generatedFileName ?? "serverless-route";
		const projectRoot = process.cwd();
		const srcPath = path3.join(projectRoot, data.projectRoot);
		const serverlessPath = path3.join(projectRoot, `${fileName}.js`);
		const generator = new ServerlessGenerator(srcPath, serverlessPath);
		generator.generate();
		console.log("Route generation completed successfully!");
	} catch (error) {
		console.error("Error generating routes:", error);
		process.exit(1);
	}
}
__name(generate, "generate");

// src/index.ts
async function importConfigFile() {
	try {
		const filename = "serverless-route.config";
		const configFileJson = path4.join(process.cwd(), `${filename}.json`);
		if (fs2.existsSync(configFileJson)) {
			const data = fs2.readFileSync(configFileJson, "utf-8");
			const parse = JSON.parse(data);
			await generate(parse);
			return;
		}
		const configFileJs = path4.join(process.cwd(), `${filename}.js`);
		if (fs2.existsSync(configFileJs)) {
			const data = await import(configFileJs);
			const configData = data.default;
			await generate(configData);
			return;
		}
		throw new Error(
			`Could not find config file at ${configFileJson} or ${configFileJs}`,
		);
	} catch (error) {
		const err = error;
		console.error(err.message);
		process.exit(1);
	}
}
__name(importConfigFile, "importConfigFile");
importConfigFile().catch(console.error);
export { createHandler, importConfigFile as default };
//# sourceMappingURL=index.mjs.map
