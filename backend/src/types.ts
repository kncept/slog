
// including: 
// aws response types


// see https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-output-format
export interface LambdaProxyResponse {
    isBase64Encoded: boolean,
    statusCode: number
    headers: Record<string, string>
    body: string
}
