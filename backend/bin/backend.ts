#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { BackendStack } from '../lib/backend-stack'
import * as path from 'path'
import { baseSlogName } from '../tools/name-tools'
import { extractDomainNameFromFQDN, fullyQualifiedApiDomainName, fullyQualifiedFrontendDomainName } from '../tools/domain-tools'
import { HostedZoneStack, determineHostedZoneIdLookup } from '../lib/hosted-zone-stack'
import { FrontendStack } from '../lib/frontend-stack'
import { Construct } from 'constructs'

const projectRootDir = path.join(__dirname, '..', '..')

export class ApplicationStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
  ) {
    super(scope, id, {
      // crossRegionReferences: true,
      env: {
        region: process.env.AWS_REGION
      }
    })
  }

  async init() {

    const backendHostedZone = new HostedZoneStack(this, `BackendZone`, {
      prefix: 'be',
      hostedZoneName: extractDomainNameFromFQDN(fullyQualifiedFrontendDomainName()),
      hostedZoneIdLookup: await determineHostedZoneIdLookup('be', fullyQualifiedFrontendDomainName())
    })
    backendHostedZone.generateOutputs(this, 'be')

    const frontendHostedZone = new HostedZoneStack(this, `FrontendZone`, {
      prefix: 'fe',
      hostedZoneName: extractDomainNameFromFQDN(fullyQualifiedFrontendDomainName()),
      hostedZoneIdLookup: await determineHostedZoneIdLookup('fe', fullyQualifiedFrontendDomainName())
    })
    frontendHostedZone.generateOutputs(this, 'fe')
  
    // Backend API/Lambda and S3 bucket
    const backendStack = new BackendStack(this, `Backend`, {
      projectRootDir,
      blogBaseName: baseSlogName(),
      hostedZone: backendHostedZone.zone,
      domainName: fullyQualifiedApiDomainName(),
    })
  
    // Cloudfront distribution of static frontend
    const frontendStack = new FrontendStack(this, `Frontend`, {
      projectRootDir,
      blogBaseName: baseSlogName(),
      hostedZone: frontendHostedZone.zone,
      domainName: fullyQualifiedFrontendDomainName(),
    })

    // these stacks can wait
    backendStack.addDependency(backendHostedZone)
    frontendStack.addDependency(frontendHostedZone)
  }

  // create a 'nice' (ish) nahe for nested stack resources
  getLogicalId(element: cdk.CfnElement): string {
    if (element.node.id.includes('NestedStackResource')) {
        return /([a-zA-Z0-9]+)\.NestedStackResource/.exec(element.node.id)![1] // will be the exact id of the stack
    }
    return super.getLogicalId(element)
}
}



async function defineStack() {
  const app = new cdk.App()
  const stack = new ApplicationStack(app, baseSlogName())
  await stack.init()
}

defineStack()