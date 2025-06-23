import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';
import { Construct } from 'constructs';
import path from 'path';

export class PaymentStack extends  cdk.Stack{
    public readonly paymentCheckLambda: lambda.NodejsFunction;
    public readonly walletLambda: lambda.NodejsFunction;
    public readonly ledgerLambda: lambda.NodejsFunction;
    public readonly walletTable: dynamodb.Table;
    public readonly ledgerTable: dynamodb.Table;
    public readonly walletQueue: sqs.Queue;
    public readonly ledgerQueue: sqs.Queue;
    public readonly paymentRequestLambda: lambda.NodejsFunction;

    constructor(scope: Construct, id: string, props?:cdk.StackProps){
        super(scope,id);

        this.paymentRequestLambda = new lambda.NodejsFunction(this, "PaymentRequestService",{
            runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
            handler: "handler",
            entry: path.join(__dirname, "..", "..", "services", "paymentservice","")
        })

        this.paymentCheckLambda = new lambda.NodejsFunction(this, "PaymentCheckService", {
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

        this.walletQueue = new sqs.Queue(this, "PaymentWalletServiceQueue",{
            queueName: 'PaymentWalletServiceQueue.fifo',
            fifo: true
        });

        this.ledgerQueue = new sqs.Queue(this, "PaymentLedgerServiceQueue",{
            queueName: 'PaymentLedgerServiceQueue.fifo',
            fifo: true
        });

        this.walletQueue.grantSendMessages(this.paymentCheckLambda);
        this.ledgerQueue.grantSendMessages(this.paymentCheckLambda);

        this.paymentCheckLambda.addEnvironment('PaymentWalletServiceQueueUrl', this.walletQueue.queueUrl);
        this.paymentCheckLambda.addEnvironment('PaymentLedgerServiceQueueUrl', this.ledgerQueue.queueUrl);
        this.walletLambda.addEnvironment("tableName",this.walletTable.tableName);
        this.ledgerLambda.addEnvironment("tableName",this.ledgerTable.tableName);

        this.walletLambda.addEventSource(new lambdaEventSources.SqsEventSource(this.walletQueue,{
            batchSize:5,
            reportBatchItemFailures: true,
            maxConcurrency:5
        }));

        this.ledgerLambda.addEventSource(new lambdaEventSources.SqsEventSource(this.ledgerQueue,{
            batchSize: 5,
            reportBatchItemFailures: true,
            maxConcurrency:5
        }));

        const apiservice = new apigateway.RestApi(this, 'StripeWebhookapi');
        const stripe = apiservice.root.addResource("stripe-webhook");
        
        stripe.addMethod('POST', new apigateway.LambdaIntegration(this.paymentCheckLambda));
    }
}