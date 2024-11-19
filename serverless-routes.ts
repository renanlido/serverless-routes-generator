export const functions = {
	routePath: {
		handler: "example/src/modules/test/handler.routePath",
		events: [
			{
				http: {
					cors: true,
					method: "POST",
					path: "test/route-path",
				},
			},
		],
	},
};
