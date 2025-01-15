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
	},
};
