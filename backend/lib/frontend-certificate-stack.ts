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

export interface FrontendCertificateStackProps {
  hostedZone: route53.IHostedZone
  domainName: string
}

export class FrontendCertificateStack extends cdk.Stack {
  cert: cdk.aws_certificatemanager.Certificate
  constructor(
    scope: Construct,
    id: string,
    props: FrontendCertificateStackProps
  ) {
    super(scope, id, {
      crossRegionReferences: true,
      env: {
        region: 'us-east-1',
    }
  })
    const prefix = 'SSB-Cert'

    // cert may be in a different region, so we don't link the passed in hosted zone
    // const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, `${prefix}-hostedzone`, {
    //   hostedZoneId: props.hostedZone.hostedZoneId,
    //   zoneName: props.hostedZone.zoneName,
    // })
    const hostedZone = props.hostedZone

    this.cert = new cdk.aws_certificatemanager.Certificate(this, `${prefix}-api-cert`, {
      domainName: props.domainName,
      validation: cdk.aws_certificatemanager.CertificateValidation.fromDns(hostedZone),
    })

  }
}
