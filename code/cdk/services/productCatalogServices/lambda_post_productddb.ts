import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { PutItemCommand } from '@aws-sdk/client-dynamodb';
import { Product, zodProduct } from './lambda_update_productddb';
import {z} from "zod/v4"

const client= new DynamoDBClient({});
const tableName=process.env.table_name;

export async function handler(event:APIGatewayProxyEvent):Promise<APIGatewayProxyResult>{
    if (!event.body) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Request body is required" })
        };
    }
    
    try {
        const body = JSON.parse(event.body);
        const product: Product = zodProduct.parse(body);

        const command = new PutItemCommand({
            TableName: tableName,
            Item: {
                id: { S: product.id },
                name: { S: product.name },
                description: { S: product.description },
                price: { N: product.price.toString() },
                stock: { N: product.stock.toString() }, 
                category: { S: product.category },
                imageUrl: {S:product.imageUrl}       
            },
            ConditionExpression: 'attribute_not_exists(id)'
            });
        
        const result = await client.send(command);
        return {
            statusCode: 201,
            body: JSON.stringify({
                message: "Product created successfully",
                product: product
            })}
    } catch (error) {
        if (error instanceof z.ZodError) {
              return {
                statusCode: 400,
                body: JSON.stringify({
                  message: "Zod Validation failure",
                  errors: error.issues
                })
              };
            } else {
              return {
                statusCode: 500,
                body: JSON.stringify({
                  message: "Error on the DB side",
                  error: String(error)
                })
              };
        }
    }
}