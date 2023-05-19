import * as path from 'path'

import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'

import * as route53 from 'aws-cdk-lib/aws-route53'

export interface HostedZoneStackProps {
  hostedZoneName: string
}

export class HostedZoneStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    props: HostedZoneStackProps,
  ) {
    super(scope, id, {})
    const prefix = 'SSB-zone'

    const zone = new route53.PublicHostedZone(this, `${prefix}-hostedzone`, {
      caaAmazon: true,
      zoneName: props.hostedZoneName,
    })
    new cdk.CfnOutput(this, 'ZoneArn', {
      value: zone.hostedZoneArn,
    })

  }
}
