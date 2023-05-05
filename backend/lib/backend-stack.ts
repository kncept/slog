import * as path from 'path'

import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'

import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as logs from 'aws-cdk-lib/aws-logs'
import * as route53 from 'aws-cdk-lib/aws-route53'
import * as apigateway from 'aws-cdk-lib/aws-apigateway'

export interface BackendStackProps extends cdk.StackProps {
  projectRootDir: string
}

export class BackendStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    props: BackendStackProps
  ) {
    super(scope, id, props)

    const prefix = 'SSB'

    // const zone = new route53.PublicHostedZone(this, `${prefix}-zone`, {
    //   caaAmazon: true,
    //   zoneName: 'TEMP'
    // })
    // new cdk.CfnOutput(this, 'ZoneArn', {
    //   value: zone.hostedZoneArn,
    // })

    // // this is crazy inefficient if you don't locally install esbuild... its downloads a nodejs builder from an aws ecr and runs an esbuild... so install it LOCALLY!!
    // const backendLambda = new lambdaNodeJs.NodejsFunction(this, `${prefix}-lambda-fn`, {
    //   functionName: `${prefix}-lambda`,
    //   handler: 'handler',
    //   runtime: lambda.Runtime.NODEJS_18_X,
    //   entry: path.join(props.projectRootDir, 'backend', 'src', 'index.ts'),
    //   environment: {
    //     "customProp": "customPropValue",
    //   },
    //   logRetention: logs.RetentionDays.ONE_MONTH,
    //   bundling: {
    //     minify: true,
    //     externalModules: ['aws-sdk'],
    //   },
    // })

    const backendLambda = new lambda.Function(this, `${prefix}-lambda-fn`, {
      functionName: `${prefix}-lambda`,
      handler: 'index.handler',
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset(path.join(props.projectRootDir, 'backend', 'dist', 'backend', 'src')),
      environment: {
        PUBLIC_URL: process.env.PUBLIC_URL || '',
        ADMIN_USER: process.env.ADMIN_USER || '',
      },
      logRetention: logs.RetentionDays.ONE_MONTH,
    })

    // compress all responses, and convert binary types to BINARY!
    const restApi = new apigateway.LambdaRestApi(this, `${prefix}-rest-api`, {
      restApiName: `${prefix}-api`,
      handler: backendLambda,
      description: 'Lambda Acccess API',
      minimumCompressionSize: 0,
      binaryMediaTypes: [
        '*/*'
      ],
    })

    new cdk.CfnOutput(this, 'RestApiUrl', {
      value: restApi.url,
    })
  }
}
