import * as path from 'path'

import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'

import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as lambdaNodeJs from 'aws-cdk-lib/aws-lambda-nodejs'
import * as logs from 'aws-cdk-lib/aws-logs'
import * as apigateway from 'aws-cdk-lib/aws-apigateway'
import * as route53 from 'aws-cdk-lib/aws-route53'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as s3 from 'aws-cdk-lib/aws-s3'

export interface BackendStackProps {
  projectRootDir: string
  blogBaseName: string
  hostedZone: route53.IHostedZone
  domainName: string
}

export class BackendStack extends cdk.NestedStack {
    constructor(
    scope: Construct,
    id: string,
    props: BackendStackProps
  ) {
    super(scope, id, {})
    const prefix = 'SSB-BE'

    const apiCertificate = new cdk.aws_certificatemanager.Certificate(this, `${prefix}-api-cert`, {
      domainName: props.domainName,
      validation: cdk.aws_certificatemanager.CertificateValidation.fromDns(props.hostedZone)
    })

    const bucket = new s3.Bucket(this, `${prefix}-bucket`, {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    })

    new cdk.CfnOutput(this, 'BucketName', {
      value: bucket.bucketName,
    })

    const role = new iam.Role(this, `${prefix}-role`, {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole"),
      ],
    })

    bucket.grantReadWrite(role)

    const backendLambda = new lambdaNodeJs.NodejsFunction(this, `${prefix}-lambda-fn`, {
      functionName: `${props.blogBaseName}-lambda`,
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_18_X,
      description: `${props.blogBaseName} Lambda`,
      entry: path.join(props.projectRootDir, 'backend', 'src', 'index.ts'),
      environment: {
        PUBLIC_URL: process.env.PUBLIC_URL || '',
        REACT_APP_API_ENDPOINT: process.env.REACT_APP_API_ENDPOINT || '',
        ADMIN_USERS: process.env.ADMIN_USERS || '[]',
        S3_BUCKET_NAME: bucket.bucketName,
        LOGIN_PROVIDERS: process.env.LOGIN_PROVIDERS || '[]',

        JWT_PARAM_HACK: 'true',
      },
      logRetention: logs.RetentionDays.ONE_MONTH,
      bundling: {
        minify: true,
        externalModules: ['aws-sdk'],
      },
      role,
    })
    new cdk.CfnOutput(this, `${prefix}-lambda-arn`, {
      value: backendLambda.functionArn,
    })

    // compress all responses, and convert binary types to BINARY!
    const restApi = new apigateway.LambdaRestApi(this, `${prefix}-api-lambda`, {
      restApiName: `${props.blogBaseName}-api`,
      handler: backendLambda,
      description: `${props.blogBaseName} Lambda Access API`,
      minCompressionSize: cdk.Size.bytes(0),
      binaryMediaTypes: [
        '*/*'
      ],
      integrationOptions: {
        allowTestInvoke: false,
      },
      endpointTypes: [apigateway.EndpointType.REGIONAL],
    })
    const apiDomainNameMountPoint = restApi.addDomainName(`${prefix}-api-domain-name`, {
      domainName: props.domainName,
      certificate: apiCertificate,
    })

    new cdk.CfnOutput(this, 'RestApiUrl', {
      value: restApi.url,
    })

    new route53.CnameRecord(this, `${prefix}-dns-entry`, {
      zone: props.hostedZone,
      recordName: props.domainName.substring(0, props.domainName.length - (props.hostedZone.zoneName.length + 1)),
      domainName: apiDomainNameMountPoint!.domainNameAliasDomainName,
    })
  }
}
