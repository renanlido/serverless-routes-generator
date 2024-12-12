export const functions = {
	routePath: {
		handler: "example/src/modules/test/handler.routePath",
		events: [
			{
				http: {
					method: "GET",
					path: "/test",
				},
			},
		],
	},
};
