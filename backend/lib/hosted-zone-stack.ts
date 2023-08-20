import { lookupOutputs } from '../tools/cloudformation-tools'
import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as route53 from 'aws-cdk-lib/aws-route53'
import { matchHostedZoneToDomainUrl } from '../tools/domain-tools'
import { superSimpleBaseBlogName } from '../tools/name-tools'

export interface HostedZoneStackProps {
  prefix: string,
  hostedZoneName: string,
  hostedZoneIdLookup: string | null, // pass in NULL to create, or a valid ID to look up. N.B. this must 'latch'
}

export async function determineHostedZoneIdLookup(prefix: string, fqdn: string): Promise<string | null> {
  const stackOutputs = await lookupOutputs(superSimpleBaseBlogName())
  if (stackOutputs) {
    const isLookup = stackOutputs[`${prefix}-is-lookup`]
    return isLookup ? stackOutputs[`${prefix}-zone-id`] : null
  }
  const matchedDomains = await matchHostedZoneToDomainUrl(fqdn)
  if (matchedDomains) return matchedDomains.id
  return null

}

export class HostedZoneStack extends cdk.NestedStack {
  zone: route53.IHostedZone
  props: HostedZoneStackProps
  constructor(
    scope: Construct,
    id: string,
    props: HostedZoneStackProps,
  ) {
    super(scope, id, {})
    this.props = props
    const prefix = props.prefix
    
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
    // this.generateOutputs(this, prefix)
  }

  generateOutputs(parent: Construct, prefix: string) {
    new cdk.CfnOutput(parent, `${prefix}-arn-out`, {
      value: this.zone.hostedZoneArn,
      exportName: `${prefix}-zone-arn`,
    })
    new cdk.CfnOutput(parent, `${prefix}-name-out`, {
      value: this.zone.zoneName,
      exportName: `${prefix}-zone-name`,
    })
    new cdk.CfnOutput(parent, `${prefix}-zone-id-out`, {
      value: this.zone.hostedZoneId,
      exportName: `${prefix}-zone-id`,
    })
    new cdk.CfnOutput(parent, `${prefix}-is-lookup-out`, {
      value: `${this.props.hostedZoneIdLookup !== null}`,
      exportName: `${prefix}-is-lookup`,
    })
  }
}
