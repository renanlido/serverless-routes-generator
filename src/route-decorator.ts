import path from "path";
import { lambdaIsRunning } from "./utils/lambda-is-running";

// src/shared/decorators/route.ts
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

type S3Event = {
	s3: {
		bucket: string;
		event?: string;
		events?: string[];
		rules?: {
			prefix?: string;
			suffix?: string;
		}[];
		existing?: boolean;
	};
};

export type HttpEvent = {
	http: {
		method: HttpMethod;
		path: string;
		cors?:
			| boolean
			| {
					origins: string[];
					headers: string[];
					allowCredentials?: boolean;
			  };
		authorizer?: any;
	};
};

type ServerlessEvent = S3Event | HttpEvent;

type HttpRouteConfig = {
	name: string;
	events: ServerlessEvent[];
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
		const path = config.events.find((event) => "http" in event).http.path;

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
