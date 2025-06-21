import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { z } from "zod/v4";

const client = new DynamoDBClient({});
const tableName = process.env.table_name;

export const zodProduct = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number().min(0),
  stock: z.number().min(0),
  category: z.string(),
  imageUrl: z.string()
});

export type Product = z.infer<typeof zodProduct>;

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Request body is required" })
    };
  }

  try {
    const body = JSON.parse(event.body);
    const product: Product = zodProduct.parse(body);

    const command = new UpdateItemCommand({
      TableName: tableName,
      Key: {
        id: { S: product.id }
      },
      UpdateExpression: `
        SET #name = :name,
            #description = :description,
            #price = :price,
            #stock = :stock,
            #category = :category,
            #imageUrl = :imageUrl
      `,
      ExpressionAttributeNames: {
        "#name": "name",
        "#description": "description",
        "#price": "price",
        "#stock": "stock",
        "#category": "category",
        "#imageUrl": "imageUrl"
      },
      ExpressionAttributeValues: {
        ":name": { S: product.name },
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
