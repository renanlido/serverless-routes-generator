// @ts-ignore
import {
	AwsAlbListenerArn,
	AwsAlexaEventToken,
	AwsArn,
	AwsArnString,
	AwsCfFunction,
	AwsCfIf,
	AwsCfImport,
	AwsCfInstruction,
	AwsCfRef,
	AwsKmsArn,
	AwsLambdaLayers,
	AwsLogGroupName,
	AwsSecretsManagerArnString,
	FilterPatterns,
	FunctionName,
} from "@serverless/typescript";

export type Layers = AwsLambdaLayers;
// Tipos Base
export type BaseEvent = {
	__schemaWorkaround__?: null;
};

// Schedule Event
export type ScheduleInput =
	| string
	| {
			body: string;
	  }
	| {
			[k: string]: unknown;
	  };

export type ScheduleConfig = {
	rate: (AwsCfFunction | string)[];
	enabled?: boolean;
	name?: string;
	description?: string;
	input?: ScheduleInput;
	inputPath?: string;
	inputTransformer?: {
		inputTemplate: string;
		inputPathsMap?: Record<string, unknown>;
	};
	method?: "eventBus" | "scheduler";
	timezone?: string;
};

export type ScheduleEvent = {
	schedule: string | ScheduleConfig;
};

// S3 Event
export type S3Event = {
	s3:
		| string
		| {
				bucket: string | AwsCfFunction | AwsCfIf;
				event?: string;
				existing?: boolean;
				forceDeploy?: boolean;
				rules?: {
					prefix?: string | AwsCfFunction;
					suffix?: string | AwsCfFunction;
				}[];
		  };
};

// HTTP Event
export type HttpMethod =
	| "GET"
	| "POST"
	| "PUT"
	| "PATCH"
	| "OPTIONS"
	| "HEAD"
	| "DELETE"
	| "ANY";

export type HttpCors = {
	allowCredentials?: boolean;
	cacheControl?: string;
	headers?: string[];
	maxAge?: number;
	methods?: HttpMethod[];
	origin?: string;
	origins?: string[];
};

export type HttpAuthorizer = {
	arn?: AwsArn;
	authorizerId?: AwsCfInstruction;
	claims?: string[];
	identitySource?: string;
	identityValidationExpression?: string;
	managedExternally?: boolean;
	name?: string;
	resultTtlInSeconds?: number;
	scopes?: (string | AwsCfInstruction)[];
	type?: string;
};

export type HttpEvent = {
	http:
		| string
		| {
				async?: boolean;
				authorizer?: string | HttpAuthorizer;
				connectionId?: AwsCfInstruction;
				connectionType?: string;
				cors?: boolean | HttpCors;
				integration?: string;
				method: string;
				operationId?: string;
				path: string;
				private?: boolean;
				request?: {
					contentHandling?: "CONVERT_TO_BINARY" | "CONVERT_TO_TEXT";
					method?: string;
					parameters?: {
						querystrings?: Record<
							string,
							boolean | { required?: boolean; mappedValue?: AwsCfInstruction }
						>;
						headers?: Record<
							string,
							boolean | { required?: boolean; mappedValue?: AwsCfInstruction }
						>;
						paths?: Record<
							string,
							boolean | { required?: boolean; mappedValue?: AwsCfInstruction }
						>;
					};
					passThrough?: "NEVER" | "WHEN_NO_MATCH" | "WHEN_NO_TEMPLATES";
					schemas?: Record<string, Record<string, unknown> | string>;
					template?: Record<string, string>;
					uri?: AwsCfInstruction;
				};
				response?: {
					contentHandling?: "CONVERT_TO_BINARY" | "CONVERT_TO_TEXT";
					headers?: Record<string, string>;
					template?: string;
					statusCodes?: Record<
						string,
						{
							headers?: Record<string, string>;
							pattern?: string;
							template?: string | Record<string, string>;
						}
					>;
				};
		  };
};

// WebSocket Event
export type WebSocketEvent = {
	websocket:
		| string
		| {
				route: string;
				routeResponseSelectionExpression?: "$default";
				authorizer?: AwsArnString | FunctionName | Record<string, unknown>;
		  };
};

// SNS Event
export type SnsEvent = {
	sns: string | AwsArnString | Record<string, unknown>;
};

// Stream Event
export type StreamEvent = {
	stream:
		| AwsArnString
		| {
				arn: AwsCfFunction | AwsArnString;
				[k: string]: unknown;
		  };
};

// Kafka Event
export type KafkaEvent = {
	kafka: {
		accessConfigurations: {
			vpcSubnet?: string[];
			vpcSecurityGroup?: string[];
			saslPlainAuth?: AwsSecretsManagerArnString[];
			saslScram256Auth?: AwsSecretsManagerArnString[];
			saslScram512Auth?: AwsSecretsManagerArnString[];
			clientCertificateTlsAuth?: AwsSecretsManagerArnString[];
			serverRootCaCertificate?: AwsSecretsManagerArnString[];
		};
		batchSize?: number;
		maximumBatchingWindow?: number;
		enabled?: boolean;
		bootstrapServers: string[];
		startingPosition?: "LATEST" | "TRIM_HORIZON" | "AT_TIMESTAMP";
		startingPositionTimestamp?: number;
		topic: string;
		consumerGroupId?: string;
		filterPatterns?: FilterPatterns;
	};
};

// Cognito Event
export type CognitoTrigger =
	| "PreSignUp"
	| "PostConfirmation"
	| "PreAuthentication"
	| "PostAuthentication"
	| "PreTokenGeneration"
	| "CustomMessage"
	| "DefineAuthChallenge"
	| "CreateAuthChallenge"
	| "VerifyAuthChallengeResponse"
	| "UserMigration"
	| "CustomSMSSender"
	| "CustomEmailSender";

export type CognitoUserPoolEvent = {
	cognitoUserPool: {
		pool: string;
		trigger: CognitoTrigger;
		existing?: boolean;
		forceDeploy?: boolean;
		kmsKeyId?: AwsKmsArn;
	};
};

// SQS Event
export type SqsEvent = {
	sqs:
		| AwsArnString
		| {
				arn: AwsArn;
				batchSize?: number;
				enabled?: boolean;
				maximumBatchingWindow?: number;
				functionResponseType?: "ReportBatchItemFailures";
				filterPatterns?: FilterPatterns;
				maximumConcurrency?: number;
		  };
};

// ALB Event
export type AlbEvent = {
	alb: {
		authorizer?: string[];
		conditions: {
			header?:
				| {
						name: string;
						values: string[];
				  }[]
				| {
						name: string;
						values: string[];
				  };
			host?: string[];
			ip?: string[];
			method?: string[];
			path?: string[];
			query?: Record<string, string>;
		};
		healthCheck?:
			| boolean
			| {
					healthyThresholdCount?: number;
					intervalSeconds?: number;
					matcher?: {
						httpCode?: string;
					};
					path?: string;
					timeoutSeconds?: number;
					unhealthyThresholdCount?: number;
			  };
		listenerArn: AwsAlbListenerArn | AwsCfRef;
		multiValueHeaders?: boolean;
		priority: number;
		targetGroupName?: string;
	};
};

// Alexa Events
export type AlexaSkillEvent = {
	alexaSkill:
		| AwsAlexaEventToken
		| {
				appId: AwsAlexaEventToken;
				enabled?: boolean;
		  };
};

// CloudWatch Events
export type CloudWatchLogEvent = {
	cloudwatchLog:
		| AwsLogGroupName
		| {
				logGroup: AwsLogGroupName;
				filter?: string;
		  };
};

// Message Queue Events
export type ActiveMQEvent = {
	activemq: {
		arn: string | AwsCfImport | AwsCfRef;
		basicAuthArn: AwsSecretsManagerArnString | AwsCfImport | AwsCfRef;
		batchSize?: number;
		maximumBatchingWindow?: number;
		enabled?: boolean;
		queue: string;
		filterPatterns?: FilterPatterns;
	};
};

export type RabbitMQEvent = {
	rabbitmq: {
		arn: string | AwsCfImport | AwsCfRef;
		basicAuthArn: AwsSecretsManagerArnString | AwsCfImport | AwsCfRef;
		batchSize?: number;
		maximumBatchingWindow?: number;
		enabled?: boolean;
		queue: string;
		virtualHost?: string;
		filterPatterns?: FilterPatterns;
	};
};

export type MSKEvent = {
	msk: {
		arn: AwsArnString | AwsCfImport | AwsCfRef;
		batchSize?: number;
		maximumBatchingWindow?: number;
		enabled?: boolean;
		startingPosition?: "LATEST" | "TRIM_HORIZON" | "AT_TIMESTAMP";
		startingPositionTimestamp?: number;
		topic: string;
		saslScram512?: AwsArnString;
		consumerGroupId?: string;
		filterPatterns?: FilterPatterns;
	};
};

// Tipo Final Events
export type Events = (
	| BaseEvent
	| ScheduleEvent
	| S3Event
	| HttpEvent
	| WebSocketEvent
	| SnsEvent
	| StreamEvent
	| KafkaEvent
	| CognitoUserPoolEvent
	| SqsEvent
	| AlbEvent
	| AlexaSkillEvent
	| CloudWatchLogEvent
	| ActiveMQEvent
	| RabbitMQEvent
	| MSKEvent
)[];
