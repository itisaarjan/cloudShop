import * as cdk from 'aws-cdk-lib';


import { Template } from 'aws-cdk-lib/assertions';
import { ProductCatalogStack } from '../lib/productCatalog/stack';

describe('Snapshot testing to detect sudden infra changes',()=>{
    const testApp = new cdk.App({
        outdir: 'cdk.out',
    });

    const ProductCatalogTestStack = new ProductCatalogStack(testApp,'ProductCatalogTest');

    const ProductCatalogStacktemplate = Template.fromStack(ProductCatalogTestStack);
    
    test('Snapshot test',()=>{
        expect(ProductCatalogStacktemplate.toJSON()).toMatchSnapshot();
    })
})