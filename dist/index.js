"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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
var __export = (target, all) => {
	for (var name in all)
		__defProp(target, name, { get: all[name], enumerable: true });
};
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
var __toCommonJS = (mod) =>
	__copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __publicField = (obj, key, value) =>
	__defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// src/index.ts
var src_exports = {};
__export(src_exports, {
	createHandler: () => createHandler,
	default: () => importConfigFile,
});
module.exports = __toCommonJS(src_exports);
var import_fs = __toESM(require("fs"));
var path4 = __toESM(require("path"));

// src/route-importer.ts
var path3 = __toESM(require("path"));
var import_url = __toESM(require("url"));
var import_glob = require("glob");

// src/route-generator.ts
var fs = __toESM(require("fs"));
var path2 = __toESM(require("path"));

// src/route-decorator.ts
var import_path = __toESM(require("path"));
var routeConfigs = /* @__PURE__ */ new Map();
function getContext(match) {
	if (match && match[1]) {
		const caminhoCompleto = match[1];
		const diretorio = import_path.default.dirname(caminhoCompleto);
		const indiceSrc = diretorio.indexOf(import_path.default.join("src"));
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
	const handlers = (0, import_glob.globSync)(handlersPath);
	for (const handler of handlers) {
		try {
			const handlerUrl = import_url.default.pathToFileURL(handler).href;
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
		if (import_fs.default.existsSync(configFileJson)) {
			const data = import_fs.default.readFileSync(configFileJson, "utf-8");
			const parse = JSON.parse(data);
			await generate(parse);
			return;
		}
		const configFileJs = path4.join(process.cwd(), `${filename}.js`);
		if (import_fs.default.existsSync(configFileJs)) {
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
// Annotate the CommonJS export names for ESM import in node:
0 &&
	(module.exports = {
		createHandler,
	});
//# sourceMappingURL=index.js.map
