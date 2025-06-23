import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!,{
    apiVersion: '2025-05-28.basil'
})

export async function handler(event: APIGatewayProxyEvent):Promise<APIGatewayProxyResult>{
    if(!event.body){
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Request body is required" }) 
        }
    }

    const {orderId, userId, items, totalAmount}=JSON.parse(event.body);
    
    const stripeSession = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items:[

        ],
        mode:"payment",
        success_url:'',
        cancel_url:'',
    });

    return {
        statusCode: 200,
        body: JSON.stringify({
            url: stripeSession.url
        })
    }
}