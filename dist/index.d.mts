type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
interface RouteConfig {
	method: HttpMethod;
	path: string;
	cors?: boolean;
	name?: string;
}
declare const createHandler: (
	config: RouteConfig,
	handler: (...args: unknown[]) => unknown,
) => (...args: unknown[]) => unknown;

type GeneratorConfigFileData = {
	pathPattern: string;
	projectRoot: string;
	generatedFileName?: string;
};

declare function importConfigFile(): Promise<void>;

export {
	type GeneratorConfigFileData,
	createHandler,
	importConfigFile as default,
};
