import * as fs from "fs";
import * as path from "path";

import { GeneratorConfigFileData } from "./import-config-file";
import { getRouteConfigs } from "./route-decorator";

export class ServerlessGenerator {
	constructor(
		private readonly basePath: string,
		private readonly outputPath: string,
		private readonly config: GeneratorConfigFileData,
	) {}

	private generateFunctionConfig(): Record<string, unknown> {
		const routes = getRouteConfigs();

		const functions: Record<string, unknown> = {};

		routes.forEach((route) => {
			const { name, events, context, handlerRoutePath, ...rest } = route;

			const routeContext = route.context.indexOf(this.config.projectRoot);

			let relativePath: string;

			if (routeContext !== -1) {
				relativePath = context.substring(routeContext);
			}

			if (!relativePath) {
				throw new Error("Could not find relative path for route");
			}

			const handlerPath = path.relative(
				this.basePath,
				path.join(this.basePath, relativePath, handlerRoutePath),
			);

			functions[name] = {
				handler: handlerPath,
				events: events,
				...rest,
			};
		});

		return functions;
	}

	private generateFunctionConfigJS(): string {
		const functions = this.generateFunctionConfig();

		return `
    module.exports = {
      functions: ${JSON.stringify(functions, null, 2)}
    };`;
	}

	private generateFunctionConfigTS(): string {
		const functions = this.generateFunctionConfig();

		return `export const functions = ${JSON.stringify(functions, null, 2)};`;
	}

	public generate(): void {
		let config: string;

		if (this.config.generatedFileExtension === "ts") {
			config = this.generateFunctionConfigTS();
		} else {
			config = this.generateFunctionConfigJS();
		}

		fs.writeFileSync(this.outputPath, config);
		console.log(`Serverless config generated at ${this.outputPath}`);
	}
}
