import { createHandler } from "../../../../src/route-decorator";

export const routePath = createHandler(
	{
		method: "POST",
		path: "test/route-path",
		cors: true,
		name: "routePath",
	},
	async () => {
		return {
			statusCode: 200,
			body: JSON.stringify({ message: "Hello World" }),
		};
	},
);
