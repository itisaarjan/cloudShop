import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient, GetItemCommand, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { z } from 'zod/v4';

const client = new DynamoDBClient({});
const tableName = process.env.table_name;

export const productSchema = z.object({
  id: z.string().min(1, "id is required"),
  name: z.string().min(1, "name is required"),
  description: z.string().min(1, "description is required"),
  price: z.number().min(0, "price must be non-negative"),
  stock: z.number().min(0, "stock must be non-negative"),
  category: z.string().min(1, "category is required"),
  imageUrl: z.string().min(1, "imageUrl is required")
});

export type Product = z.infer<typeof productSchema>;

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

    const getCommand = new GetItemCommand({
            TableName: tableName,
            Key: {
                id: {S:product.id},
                name: {S:product.name}
            }
        })
    
        const getResult = await client.send(getCommand);
    
        if (!getResult.Item) {
          return {
            statusCode: 404,
            body: JSON.stringify({
              message: "Product not found",
              id: product.id,
              name: product.name
            })
          };
        }

    const command = new PutItemCommand({
      TableName: tableName,
      Item: {
        id: { S: product.id },
        name: { S: product.name },
        description: { S: product.description },
        price: { N: product.price.toString() },
        stock: { N: product.stock.toString() },
        category: { S: product.category },
        imageUrl: { S: product.imageUrl }
      },
      ConditionExpression: 'attribute_not_exists(id)'
    });

    await client.send(command);

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: "Product created successfully",
        product: product
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
