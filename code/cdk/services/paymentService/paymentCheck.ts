import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as SQS from "@aws-sdk/client-sqs";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!,{
    apiVersion: '2025-05-28.basil'
})

const sqs = new SQS.SQSClient({});

export async function handler(event: APIGatewayProxyEvent):Promise<APIGatewayProxyResult>{
    if(!event.body){
        return{
            statusCode: 400,
            body: JSON.stringify({
                message: "Stripe Body Error Occured",
            })
        };
    }

    const sig = event.headers['stripe-signature'] as string;
    const body = event.body;
    const webHookSecret = process.env.WEB_HOOK_SECRET!;

    let stripeEvent;

    try{
        stripeEvent = stripe.webhooks.constructEvent(body,sig,webHookSecret);
    }catch(error){
        console.error("Webhook verification failed:", error);
        return {
        statusCode: 400,
        body: `Webhook Error: ${error instanceof Error ? error.message : "Unknown error"}`
    };
    }
    
    if (stripeEvent.type === "checkout.session.completed") {
        const session = stripeEvent.data.object as Stripe.Checkout.Session;
        const payload = {
            orderId: session.metadata?.orderId,
            userId: session.metadata?.userId,
            email: session.customer_details?.email,
            amount: session.amount_total,
            sessionId: session.id
        };

    const results = await Promise.allSettled([
        sqs.send(new SQS.SendMessageCommand({
            QueueUrl: process.env.WALLET_QUEUE_URL!,
            MessageBody: JSON.stringify(payload),
            MessageGroupId: "wallet-group"
        })),

        sqs.send(new SQS.SendMessageCommand({
            QueueUrl: process.env.LEDGER_QUEUE_URL!,
            MessageBody: JSON.stringify(payload),
            MessageGroupId: "ledger-group"
        }))
        ]);

        const [walletResult, ledgerResult] = results;

        if(walletResult.status == 'rejected'){
            console.error("Failed to send to walletQeue", walletResult.reason);
        }

        if(ledgerResult.status == 'rejected'){
            console.error("Failed to send ledgerQueue Result", ledgerResult.reason);
        }

        if(walletResult.status == 'rejected' || ledgerResult.status =='rejected'){
            return {
                statusCode: 500,
                body: "One or both queues failed"
            }
        }

        return {
            statusCode: 200,
            body:JSON.stringify({
                message: "Checkout Session completed"
            })
        }
    }

    return{
        statusCode: 400,
        body: JSON.stringify({
            message: "Checkout session could not be completed"
        })
    }

    
}