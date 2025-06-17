#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { ProductCatalogStack } from '../lib/productCatalog/stack';

const app = new cdk.App();
new ProductCatalogStack(app, 'ProductCatalog', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  }
});