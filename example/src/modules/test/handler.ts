import { createHandler } from "../../../../src/route-decorator";

// import { createHandler } from "@renanlido/serverless-routes-generator";

export const routePath = createHandler(
	{
		name: "routePath",
		events: [
			{
				http: {
					method: "GET",
					path: "/test",
				},
			},
			{
				s3: {
					bucket: "bucket",
					event: "s3:ObjectCreated:*",
				},
			},
		],
		layers: [
			{
				Ref: "LayerLambdaLayer",
			},
		],
		memorySize: 256,
	},
	async () => {
		// This is a simple example of a handler that returns a JSON object

		return {
			statusCode: 200,
			body: JSON.stringify({ message: "Hello World" }),
		};
	},
);
