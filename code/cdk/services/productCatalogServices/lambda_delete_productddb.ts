import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient, DeleteItemCommand, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { z } from 'zod/v4';

const client = new DynamoDBClient({});
const tableName = process.env.table_name;

const querySchema = z.object({
  id: z.string().min(1, "Product ID is required"),
  name: z.string().min(1, "Product Name is required")
});

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const query = querySchema.parse(event.queryStringParameters ?? {});

    const getCommand = new GetItemCommand({
        TableName: tableName,
        Key: {
            id: {S:query.id},
            name: {S:query.name}
        }
    })

    const getResult = await client.send(getCommand);

    if (!getResult.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: "Product not found",
          id: query.id,
          name: query.name
        })
      };
    }


    const deleteCommand = new DeleteItemCommand({
      TableName: tableName,
      Key: {
        id: { S: query.id },
        name: {S: query.name}
      }
    });

    await client.send(deleteCommand);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Product deleted successfully",
        id: query.id
      })
    };

  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Invalid query parameters",
          errors: error.issues
        })
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error deleting product",
        error: String(error)
      })
    };
  }
}
