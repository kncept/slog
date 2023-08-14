import { lookupOutputs } from '../tools/cloudformation-tools'
import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as route53 from 'aws-cdk-lib/aws-route53'
import { stackNameForHostedZone } from '../tools/name-tools'
import { listDomainNames, matchHostedZoneToDomainUrl } from '../tools/domain-tools'

export interface HostedZoneStackProps {
  hostedZoneName: string,
  hostedZoneIdLookup: string | null // pass in NULL to create, or a valid ID to look up. N.B. this must 'latch'
}

export async function determineHostedZoneIdLookup(): Promise<string | null> {
  const stackOutputs = await lookupOutputs(stackNameForHostedZone())
  if (stackOutputs) {
    const isLookup = stackOutputs['is-lookup']
    return isLookup ? stackOutputs['zone-id'] : null
  }
  const matchedDomains = await matchHostedZoneToDomainUrl()
  if (matchedDomains) return matchedDomains.id
  return null

}

export class HostedZoneStack extends cdk.Stack {
  zone: route53.IHostedZone
  constructor(
    scope: Construct,
    id: string,
    props: HostedZoneStackProps,
  ) {
    super(scope, id, {
      crossRegionReferences: true,
      env: {
        region: process.env.AWS_REGION
      }
    })
    const prefix = 'hz'

    
    if (props.hostedZoneIdLookup != null) {
      this.zone = route53.PublicHostedZone.fromHostedZoneAttributes(this, `${prefix}-public`, {
        zoneName: props.hostedZoneName,
        hostedZoneId: props.hostedZoneIdLookup,
      })
    } else {
      this.zone = new route53.PublicHostedZone(this, `${prefix}-public`, {
        caaAmazon: true,
        zoneName: props.hostedZoneName,
      })
      this.zone.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY)
    }
    new cdk.CfnOutput(this, `${prefix}-public-arn-out`, {
      value: this.zone.hostedZoneArn,
      exportName: 'zone-arn'
    })

    new cdk.CfnOutput(this, `${prefix}-hosted-zone-id`, {
      value: this.zone.hostedZoneId,
      exportName: 'zone-id'
    })
    new cdk.CfnOutput(this, `${prefix}-is-lookup`, {
      value: `${props.hostedZoneIdLookup !== null}`,
      exportName: 'is-lookup'
    })

  }
}
