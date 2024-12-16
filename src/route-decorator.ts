import path from "path";
import { Events } from "./types/function";
import { lambdaIsRunning } from "./utils/lambda-is-running";

type HttpRouteConfig = {
	name: string;
	events: Events;
};

type RouteConfig = HttpRouteConfig;

const routeConfigs = new Map<string, RouteConfig & { context: string }>();

function getContext(match: RegExpMatchArray) {
	if (match && match[1]) {
		const fullPath = match[1];

		const directory = path.dirname(fullPath);
		return directory;
	}

	return null;
}

const defineConfig = (
	config: RouteConfig & {
		context: string;
	},
) => {
	let functionName: string | undefined;

	if (config.name) {
		functionName = config.name;
	}

	if (!functionName && config.events.find((event) => "http" in event)) {
		const path = (
			config.events.find((event) => "http" in event) as {
				http: { path: string };
			}
		).http.path;

		// functionName = path.replace(/\//g, "-");
		functionName = path.split("/")[path.split("/").length - 1];
	}

	if (!functionName) {
		throw new Error("Could not find function name for route");
	}

	return {
		...config,
		name: functionName,
	};
};

export const createHandler = (
	config: RouteConfig,
	handler: (...args: any[]) => any,
) => {
	if (lambdaIsRunning()) {
		return handler;
	}

	// Registra a configuração usando o nome do arquivo + nome da função como chave
	const matchPath = new Error()
		.stack!.split("\n")[2]
		.match(/\(([^:]+):\d+:\d+\)/);

	if (!matchPath) {
		throw new Error("Could not find handler path");
	}

	const context = getContext(matchPath);

	if (!context) {
		throw new Error("Could not find handler context");
	}

	const fileName =
		new Error().stack!.split("\n")[2].match(/[/\\]([\w\-. ]+)\.[jt]s/)?.[1] ||
		"unknown";

	const key = `${fileName}.${defineConfig({ ...config, context }).name}`;

	routeConfigs.set(key, { ...config, context });

	return handler;
};

export const getRouteConfigs = () => {
	return Array.from(routeConfigs.entries()).map(
		([handlerRoutePath, config]) => ({
			handlerRoutePath,
			...defineConfig(config),
		}),
	);
};
