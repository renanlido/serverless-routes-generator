import type { AWS } from "@serverless/typescript";

import { functions } from "./serverless-routes";

const serverlessConfiguration: AWS = {
	service: "test-project",
	frameworkVersion: "3",
	package: { individually: true },
	plugins: [
		"serverless-localstack",
		"serverless-esbuild",
		"serverless-lift",
		"serverless-offline",
		"serverless-ignore",
		"serverless-prune-plugin",
		"serverless-dotenv-plugin",
		"serverless-plugin-resource-tagging",
	],
	provider: {
		name: "aws",
		timeout: 30,
		runtime: "nodejs20.x",
		stage: '${opt:stage, "staging"}',
		region: "us-east-1",
		apiName: '${self:service}-${self:provider.stage, "staging"}',
		deploymentBucket: "serverless.us-east-1",
		stackTags: { Project: "test-project" },
		tracing: { apiGateway: true, lambda: true },
		apiGateway: {
			minimumCompressionSize: 1024,
			shouldStartNameWithService: true,
			metrics: false,
			binaryMediaTypes: [
				"image/jpg",
				"image/jpeg",
				"image/png",
				"image/webp",
				"application/pdf",
			],
		},
		logs: {
			restApi: {
				level: "INFO",
				accessLogging: false,
				executionLogging: false,
				fullExecutionData: false,
			},
		},
		environment: { AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1" },
	},
	custom: {
		"local-stack": {
			stages: ["local"],
			host: "http://localhost",
			edgePort: 4566,
		},
		"serverless-offline": { httpPort: 3000 },
		prune: { automatic: true, number: 1 },
		dotenv: { logging: false },
		esbuild: {
			bundle: true,
			sourcemap: true,
			packager: "yarn",
			target: "node20",
			watch: {
				pattern: ["./example/**/*.ts"],
				ignore: ["node_modules", ".serverless", ".esbuild"],
			},
		},
	},
	functions: {
		...functions,
	},
};

module.exports = serverlessConfiguration;
