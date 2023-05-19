#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { BackendStack } from '../lib/backend-stack'
import * as path from 'path'
import { stackNameForBackend, stackNameForFrontend, stackNameForFrontendCertificate, stackNameForHostedZone, superSimpleBaseBlogName } from '../tools/name-tools'
import { matchHostedZoneToDomainUrl, extractDomainNameFromUrl, fullyQualifiedApiDomainName, fullyQualifiedFrontendDomainName } from '../tools/domain-tools'
import { HostedZoneStack } from '../lib/hosted-zone-stack'
import { FrontendStack } from '../lib/frontend-stack'
import { FrontendCertificateStack } from '../lib/frontend-certificate-stack'

const projectRootDir = path.join(__dirname, '..', '..')

async function defineStacks() {
  const app = new cdk.App()

  const hostedZone = await matchHostedZoneToDomainUrl()
  
  new HostedZoneStack(app, `${stackNameForHostedZone()}`, {
    hostedZoneName: extractDomainNameFromUrl()
  })

  // Backend API/Lambda and S3 bucket
  new BackendStack(app, `${stackNameForBackend()}`, {
    projectRootDir,
    blogBaseName: superSimpleBaseBlogName(),
    hostedZone: hostedZone!,
    domainName: fullyQualifiedApiDomainName(),
  })

  // Cloudfront certificates have to be us-east-1, because aws
  const feCertStack = new FrontendCertificateStack(app, `${stackNameForFrontendCertificate()}`, {
    hostedZone: hostedZone!,
    domainName: fullyQualifiedFrontendDomainName(),
  })
  
  // Cloudfront distribution of static frontend
  new FrontendStack(app, `${stackNameForFrontend()}`, {
    projectRootDir,
    blogBaseName: superSimpleBaseBlogName(),
    hostedZone: hostedZone!,
    domainName: fullyQualifiedFrontendDomainName(),
    cert: feCertStack.cert
  })

}

defineStacks()

