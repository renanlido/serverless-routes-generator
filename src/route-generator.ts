// tools/serverless-router-generator/route-generator.ts
import * as fs from "fs";
import * as path from "path";

import { GeneratorConfigFileData } from "./import-config-file";
import { getRouteConfigs } from "./route-decorator";

// tools/generate-routes.ts

export class ServerlessGenerator {
	constructor(
		private readonly basePath: string,
		private readonly outputPath: string,
		private readonly config: GeneratorConfigFileData,
	) {}

	private generateServerlessConfig(): string {
		const routes = getRouteConfigs();

		const functions: Record<string, unknown> = {};

		routes.forEach((route) => {
			const functionName = route.name || route.path.replace(/\//g, "-");

			const routeContext = route.context.indexOf(this.config.projectRoot);

			let relativePath: string;

			if (routeContext !== -1) {
				relativePath = route.context.substring(routeContext);
			}

			if (!relativePath) {
				throw new Error("Could not find relative path for route");
			}

			const handlerPath = path.relative(
				this.basePath,
				path.join(this.basePath, relativePath, route.handler),
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

	public generate(): void {
		const config = this.generateServerlessConfig();

		fs.writeFileSync(this.outputPath, config);
		console.log(`Serverless config generated at ${this.outputPath}`);
	}
}
