export enum LAMBDA_NAMES {
	AWS = "AWS_LAMBDA_FUNCTION_NAME",
	AZURE = "AZURE_FUNCTIONS_ENVIRONMENT",
	GOOGLE = "GOOGLE_CLOUD_FUNCTION_NAME",
}

export const lambdaIsRunning = () => {
	if (
		process.env[LAMBDA_NAMES.AWS] ||
		process.env[LAMBDA_NAMES.AZURE] ||
		process.env[LAMBDA_NAMES.GOOGLE]
	) {
		return true;
	}

	return false;
};
