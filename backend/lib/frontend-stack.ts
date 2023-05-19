import * as path from 'path'

import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'

import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as lambdaNodeJs from 'aws-cdk-lib/aws-lambda-nodejs'
import * as logs from 'aws-cdk-lib/aws-logs'
import * as apigateway from 'aws-cdk-lib/aws-apigateway'
import { HostedZoneInfo } from '../tools/domain-tools'
import * as route53 from 'aws-cdk-lib/aws-route53'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment'



export interface FrontendStackProps {
  projectRootDir: string
  blogBaseName: string
  hostedZone: HostedZoneInfo
  domainName: string
  cert: cdk.aws_certificatemanager.Certificate
}

export class FrontendStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    props: FrontendStackProps
  ) {
    super(scope, id, {
      crossRegionReferences: true,
      env: {
        region: process.env.AWS_REGION
      }
    })
    const prefix = 'SSB-FE'

    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, `${prefix}-hostedzone`, {
      hostedZoneId: props.hostedZone.id,
      zoneName: props.hostedZone.name,
    })

    const bucket = new s3.Bucket(this, `${prefix}-s3`, {
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html',
      publicReadAccess: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    })

    const distribution = new cloudfront.CloudFrontWebDistribution(this, `${prefix}-cloudfront`, {
      viewerCertificate: {
        aliases: [props.domainName],
        props: {
          acmCertificateArn: props.cert.certificateArn,
          sslSupportMethod: 'sni-only',
        },
      },
      originConfigs: [{
        s3OriginSource: {
          s3BucketSource: bucket
        },
        behaviors: [{ isDefaultBehavior: true }]
      }]
    })

    new s3deploy.BucketDeployment(this, `${prefix}-deploy`, {
      sources: [s3deploy.Source.asset(
        path.join(props.projectRootDir, 'frontend', 'build')
      )],
      destinationBucket: bucket,
      distribution: distribution, // ensure that Cloudfront picks up changes
      distributionPaths: [
        '/*' // would be nice to pick exact changed files here
      ]
    })

    new route53.CnameRecord(this, `${prefix}-cname`, {
      zone: hostedZone,
      recordName: props.domainName,
      domainName: distribution.distributionDomainName,
    })

  }
}
