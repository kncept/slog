#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { BackendStack } from '../lib/backend-stack'
import * as path from 'path'


const projectRootDir = path.join(__dirname, '..', '..')
const blogName = process.env.BLOG_NAME

const app = new cdk.App()
new BackendStack(app, `${blogName}`, {
  projectRootDir
});