import * as path from 'path'

import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'

import * as route53 from 'aws-cdk-lib/aws-route53'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment'
import * as cm from "aws-cdk-lib/aws-certificatemanager"


export interface FrontendStackProps {
  projectRootDir: string
  blogBaseName: string
  hostedZone: route53.IHostedZone
  domainName: string
}

export class FrontendStack extends cdk.NestedStack {
  constructor(
    scope: Construct,
    id: string,
    props: FrontendStackProps
  ) {
    super(scope, id, {})
    const prefix = 'SSB-FE'

    const bucket = new s3.Bucket(this, `${prefix}-s3`, {
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    })

    const originAccessIdentity = new cloudfront.OriginAccessIdentity(this, `${prefix}-OAI`, {
      // comment: 'comment',
    })
    bucket.grantRead(originAccessIdentity)

    const certificate = new cm.DnsValidatedCertificate(this, `${prefix}-cert`, {
      domainName: props.domainName,
      hostedZone: props.hostedZone,
      region: 'us-east-1', //stupid cloudfront, only using us-east-1 certificates :/
    })

    const distribution = new cloudfront.CloudFrontWebDistribution(this, `${prefix}-cloudfront`, {
      viewerCertificate: {
        aliases: [props.domainName],
        props: {
          acmCertificateArn: certificate.certificateArn,
          sslSupportMethod: 'sni-only',
        },
      },
      errorConfigurations: [{
        errorCode: 404,
        responsePagePath: '/',
        responseCode: 200,
      }],
      originConfigs: [{
        s3OriginSource: {
          originAccessIdentity,
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
      zone: props.hostedZone,
      recordName: props.domainName,
      domainName: distribution.distributionDomainName,
    })

  }
}
