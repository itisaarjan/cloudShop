#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { ProductCatalogStack } from '../lib/productCatalog/stack';
import { OIDCStack } from '../lib/CICD/githubOIDC';

const app = new cdk.App();
new OIDCStack(app,'cicdStack',{
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  }
})
new ProductCatalogStack(app, 'ProductCatalog', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  }
});