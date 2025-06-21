import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from "aws-cdk-lib/aws-lambda-nodejs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as integrations from "aws-cdk-lib/aws-apigateway";
import path from 'path';

export class ProductCatalogStack extends cdk.Stack {
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
     entry: path.join(__dirname,"..",'..',"services",'productCatalogServices',"lambda_get_productddb.ts"),
     environment:{
       table_name: table.tableName
     }
   });

   const lambdaGetAllProducts = new lambda.NodejsFunction(this, 'lambdaGetAllProducts',{
    functionName: "lambdaGetAllProducts",
    runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
    handler: 'handler',
    entry: path.join(__dirname,"..","..","services","productCatalogServices",'lambda_get_all_productddb.ts'),
    environment :{
      table_name: table.tableName
    }
   })

   const lambdaPostProduct = new lambda.NodejsFunction(this, 'lambdaPostProduct',{
    functionName: 'lambdaPostProudct',
    runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
    handler: 'handler',
    entry: path.join(__dirname, '..','..', 'services','productCatalogServices', 'lambda_post_productddb.ts'),
    environment: {
      table_name: table.tableName
    }
   })

   const lambdaDeleteProduct = new lambda.NodejsFunction(this, 'lambdaDeleteProduct', {
     functionName: 'lambdaDeleteProduct',
     runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
     handler: 'handler',
     entry: path.join(__dirname, '..','..', 'services','productCatalogServices', 'lambda_delete_productddb.ts'),
     environment: {
       table_name: table.tableName
     }
   });

   const lambdaUpdateProduct = new lambda.NodejsFunction(this, 'lambdaUpdateProduct', {
     functionName: 'lambdaUpdateProduct',
     runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
     handler: 'handler',
     entry: path.join(__dirname, '..','..', 'services','productCatalogServices', 'lambda_update_productddb.ts'),
     environment: {
       table_name: table.tableName
     }
   });

   table.grantReadData(lambdaGetProduct);
   table.grantWriteData(lambdaPostProduct);
   table.grantReadWriteData(lambdaDeleteProduct);
   table.grantReadWriteData(lambdaUpdateProduct);

   const api = new apigateway.RestApi(this, "Products");
   const v1 = api.root.addResource("v1");
   const products = v1.addResource("products");
   const productId = products.addResource("{id}");
   const productName = productId.addResource("{name}");

   productName.addMethod('GET', new integrations.LambdaIntegration(lambdaGetProduct));
   products.addMethod('Get', new integrations.LambdaIntegration(lambdaGetAllProducts));
   products.addMethod('POST', new integrations.LambdaIntegration(lambdaPostProduct));
   products.addMethod('PUT', new integrations.LambdaIntegration(lambdaUpdateProduct));
   products.addMethod('DELETE', new integrations.LambdaIntegration(lambdaDeleteProduct));
 }
}



