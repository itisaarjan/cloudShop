#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CdkStack } from '../lib/stack';

const app = new cdk.App();
new CdkStack(app, 'CdkStack', {
  
});