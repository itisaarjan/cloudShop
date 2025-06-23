import { DynamoDBClient, PutItemCommand} from "@aws-sdk/client-dynamodb";
import { SQSEvent } from "aws-lambda";
import {z} from "zod/v4";

const tableName = process.env.tableName;
const client = new DynamoDBClient({});

const schema = z.object({
    orderId: z.string().min(1, "orderId not found"),
    customerId: z.string().min(1, "customerId not found"),
    email: z.string().min(1, "Customer email is missing"),
    amount: z.string().min(0, "Amount is missing or cannot be less than zero")
})

type Payload = z.infer<typeof schema>



async function handler(event:SQSEvent){
    for(const record of event.Records){
        const messagebody = JSON.parse(record.body);

        const payload: Payload = schema.parse(messagebody);

        const postRecodCommand = new PutItemCommand({
            TableName: tableName,
            Item:{
                orderId:{
                    S: payload.orderId
                },
                customerId:{
                    S:payload.customerId
                },
                email:{
                    S:payload.email
                },
                amount:{
                    N: payload.amount
                }
            },
            ConditionExpression: 'attribute_not_exists(orderId)'
        });

        try{
            const result = await client.send(postRecodCommand);
            console.log("Payment Record Added Succesfully");
        }catch(error){
            console.log("Error occured while inserting in Wallet DB", error);
        }
       

    }
}

export {handler}