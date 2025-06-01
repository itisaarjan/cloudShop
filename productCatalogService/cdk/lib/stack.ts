import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamoDB from 'aws-cdk-lib/aws-dynamodb';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB Table
    const table = new dynamoDB.Table(this, 'ProductCatalogTable', {
      tableName: 'ProductCatalog',
      partitionKey: { name: "productId", type: dynamoDB.AttributeType.STRING },
      billingMode: dynamoDB.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      pointInTimeRecovery: true,
      timeToLiveAttribute: 'ttl'
    });

    // Lambda Function
    const productLambda = new lambdaNodejs.NodejsFunction(this, 'ProductLambda', {
      entry: path.join(__dirname, '../../lambda/productHandler.ts'),
      handler: 'handler',
      runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
      environment: {
        TABLE_NAME: table.tableName
      }
    });

    // Grant Lambda permission to read/write DynamoDB
    table.grantReadWriteData(productLambda);

    // Optional: Output for verification
    new cdk.CfnOutput(this, 'LambdaRoleArn', {
      value: productLambda.role!.roleArn,
      description: 'The IAM Role ARN for the ProductLambda'
    });
  }
}