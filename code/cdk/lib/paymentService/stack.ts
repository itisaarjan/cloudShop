import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import path from 'path';

export class PaymentStack extends  cdk.Stack{
    public readonly paymentLambda: lambda.NodejsFunction;
    public readonly walletLambda: lambda.NodejsFunction;
    public readonly ledgerLambda: lambda.NodejsFunction;
    public readonly walletTable: dynamodb.Table;
    public readonly ledgerTable: dynamodb.Table;

    constructor(scope: Construct, id: string, props?:cdk.StackProps){
        super(scope,id);

        this.paymentLambda = new lambda.NodejsFunction(this, "PaymentProcessingService", {
            runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
            handler: "handler",
            entry: path.join(__dirname, "..", "..", "services", "paymentservice","")
        });

        this.walletLambda = new lambda.NodejsFunction(this,"StoreInWalletService",{
            runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
            handler: "handler",
            entry: path.join(__dirname, "..", "..", "services", "paymentservice","")
        });

        this.ledgerLambda = new lambda.NodejsFunction(this, "OrderLedgerRecordService",{
            runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
            handler: "handler",
            entry: path.join(__dirname, "..", "..", "services", "paymentservice","")  
        })

        this.walletTable = new dynamodb.Table(this, "WalletServiceTable",{
            tableName: "PaymentServiceWalletTable",
            partitionKey:{
                name: "orderId",
                type: dynamodb.AttributeType.STRING
            },
            sortKey: {
                name: "customerId",
                type: dynamodb.AttributeType.STRING
            },
            pointInTimeRecoverySpecification:{
                pointInTimeRecoveryEnabled: true
            },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            replicationRegions:["us-west-1"]
        });
        
        this.ledgerTable = new dynamodb.Table(this, "LedgerServiceTable",{
            tableName: "PaymentServiceLedgerTable",
            partitionKey:{
                name: "orderId",
                type: dynamodb.AttributeType.STRING
            },
            sortKey: {
                name: "customerId",
                type: dynamodb.AttributeType.STRING
            },
            pointInTimeRecoverySpecification:{
                pointInTimeRecoveryEnabled: true
            },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            replicationRegions:["us-west-1"]
        });

    }
}