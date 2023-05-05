#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { BackendStack } from '../lib/backend-stack'
import * as path from 'path'

import * as crypto from 'crypto'


const uid = crypto.createHash('sha256').update('frontent uri').digest('base64').replaceAll("=", "")


const projectRootDir = path.join(__dirname, '..', '..')

console.log('projectRootDir', {projectRootDir})

const app = new cdk.App()
new BackendStack(app, 'SuperSimpleBlog-'+uid, {
  projectRootDir
});