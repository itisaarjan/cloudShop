import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { z } from 'zod/v4';
import { productSchema, Product } from './lambda_post_productddb';

const client = new DynamoDBClient({});
const tableName = process.env.table_name;



export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Request body is required" })
    };
  }

  try {
    const body = JSON.parse(event.body);
    const product: Product = productSchema.parse(body);

    const command = new UpdateItemCommand({
      TableName: tableName,
      Key: {
        id: { S: product.id },
        name: {S: product.name}
      },
      UpdateExpression: `
        SET #description = :description,
            #price = :price,
            #stock = :stock,
            #category = :category,
            #imageUrl = :imageUrl
      `,
      ExpressionAttributeNames: {
        "#description": "description",
        "#price": "price",
        "#stock": "stock",
        "#category": "category",
        "#imageUrl": "imageUrl"
      },
      ExpressionAttributeValues: {
        ":description": { S: product.description },
        ":price": { N: product.price.toString() },
        ":stock": { N: product.stock.toString() },
        ":category": { S: product.category },
        ":imageUrl": { S: product.imageUrl }
      },
      ReturnValues: "ALL_NEW"
    });

    const result = await client.send(command);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Product updated successfully",
        product: result.Attributes
      })
    };

  } catch (error) {
    if (error instanceof z.ZodError || error instanceof Error) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Invalid request body",
          errors: error instanceof z.ZodError ? error.issues : error.message
        })
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal Server Error",
        error: String(error)
      })
    };
  }
}
