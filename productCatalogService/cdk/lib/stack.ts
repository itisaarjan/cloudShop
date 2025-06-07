import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from "aws-cdk-lib/aws-lambda-nodejs"
import path from 'path';
// import * as sqs from 'aws-cdk-lib/aws-sqs';


export class CdkStack extends cdk.Stack {
 constructor(scope: Construct, id: string, props?: cdk.StackProps) {
   super(scope, id, props);


   const table = new dynamodb.Table(this,"productCatalogTable",{
     tableName: 'productCatalogTable',
     partitionKey: {
       name: 'id',
       type: dynamodb.AttributeType.STRING
     },
     sortKey:{
       name:'name',
       type: dynamodb.AttributeType.STRING
     },
     pointInTimeRecoverySpecification:{
       pointInTimeRecoveryEnabled: true
     },
     billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
     replicationRegions: ["us-west-1","us-west-2"],
    
   })


   const lambdaGetProduct = new lambda.NodejsFunction(this, 'lambdaGetProduct', {
     functionName:"lambdaGetProduct",
     runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
     handler: 'handler',
     entry: path.join(__dirname,"..","services","lambda_get_productddb.ts"),
     environment:{
       table_name: table.tableName
     }
   });

   const lambdaPostProduct = new lambda.NodejsFunction(this, 'lambdaPostProduct',{
    functionName: 'lambdaPostProudct',
    runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
    handler: 'handler',
    entry: path.join(__dirname, '..', 'services', 'lambda_post_productddb.ts'),
    environment: {
      table_name: table.tableName
    }
   })

   const lambdaDeleteProduct = new lambda.NodejsFunction(this, 'lambdaDeleteProduct', {
     functionName: 'lambdaDeleteProduct',
     runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
     handler: 'handler',
     entry: path.join(__dirname, '..', 'services', 'lambda_delete_productddb.ts'),
     environment: {
       table_name: table.tableName
     }
   });

   const lambdaUpdateProduct = new lambda.NodejsFunction(this, 'lambdaUpdateProduct', {
     functionName: 'lambdaUpdateProduct',
     runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
     handler: 'handler',
     entry: path.join(__dirname, '..', 'services', 'lambda_update_productddb.ts'),
     environment: {
       table_name: table.tableName
     }
   });

   table.grantReadData(lambdaGetProduct);
   table.grantWriteData(lambdaPostProduct);
   table.grantReadWriteData(lambdaDeleteProduct);
   table.grantReadWriteData(lambdaUpdateProduct);
 }
}




