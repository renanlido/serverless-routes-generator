// import { createHandler } from "../../../../src/route-decorator";

import { createHandler } from "@renanlido/serverless-routes-generator";

export const routePath = createHandler(
	{
		method: "POST",
		path: "test/route-path",
		cors: true,
		name: "routePath",
	},
	async () => {
		// This is a simple example of a handler that returns a JSON object

		return {
			statusCode: 200,
			body: JSON.stringify({ message: "Hello World" }),
		};
	},
);
