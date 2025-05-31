import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamoDB from 'aws-cdk-lib/aws-dynamodb';

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    const table = new dynamoDB.Table(this, 'ProductCatalogTable', {
      tableName: 'ProductCatalog',
      partitionKey: { name: "productId", type: dynamoDB.AttributeType.STRING },
      billingMode: dynamoDB.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Only for dev/test environments
      pointInTimeRecovery: true, // Enable point-in-time recovery
      timeToLiveAttribute: 'ttl' // TTL attribute for item expiration
    });

    new cdk.CfnOutput(this, 'TableName', {
      value: table.tableName,
      description: 'The name of the DynamoDB table for product catalog'
    });
  }
}
