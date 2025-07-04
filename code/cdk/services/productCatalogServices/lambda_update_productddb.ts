import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient, GetItemCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { z } from 'zod/v4';
import { productSchema, Product } from './lambda_post_productddb';
import { withCors } from '../../lib/utils/constants';

const client = new DynamoDBClient({});
const tableName = process.env.table_name;

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  if (!event.body) {
    return withCors(400, { message: "Request body is required" });
  }

  try {
    const body = JSON.parse(event.body);
    const product: Product = productSchema.parse(body);

    const getCommand = new GetItemCommand({
      TableName: tableName,
      Key: {
        id: { S: product.id },
        name: { S: product.name }
      }
    });

    const getResult = await client.send(getCommand);

    if (!getResult.Item) {
      return withCors(404, {
        message: "Product not found",
        id: product.id,
        name: product.name
      });
    }

    const command = new UpdateItemCommand({
      TableName: tableName,
      Key: {
        id: { S: product.id },
        name: { S: product.name }
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

    return withCors(200, {
      message: "Product updated successfully",
      product: result.Attributes
    });

  } catch (error) {
    return withCors(400, {
      message: "Invalid request body",
      errors: error instanceof z.ZodError ? error.issues : error instanceof Error ? error.message : String(error)
    });
  }
}
