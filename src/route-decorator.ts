import path from "path";

// src/shared/decorators/route.ts
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface RouteConfig {
	method: HttpMethod;
	path: string;
	cors?: boolean;
	name?: string;
}

enum LAMBDA_NAMES {
	AWS = "AWS_LAMBDA_FUNCTION_NAME",
	AZURE = "AZURE_FUNCTIONS_ENVIRONMENT",
	GOOGLE = "GOOGLE_CLOUD_FUNCTION_NAME",
}

const lambdaIsRunning = () => {
	if (
		process.env[LAMBDA_NAMES.AWS] ||
		process.env[LAMBDA_NAMES.AZURE] ||
		process.env[LAMBDA_NAMES.GOOGLE]
	) {
		return true;
	}

	return false;
};

const routeConfigs = new Map<string, RouteConfig & { context: string }>();

function getContext(match: RegExpMatchArray) {
	if (match && match[1]) {
		const fullPath = match[1];

		const directory = path.dirname(fullPath);
		return directory;
	}

	return null;
}

export const createHandler = (
	config: RouteConfig,
	handler: (...args: unknown[]) => unknown,
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

	const key = `${fileName}.${config.name}`;

	routeConfigs.set(key, { ...config, context });

	return handler;
};

export const getRouteConfigs = () => {
	return Array.from(routeConfigs.entries()).map(([handler, config]) => ({
		handler,
		...config,
	}));
};
