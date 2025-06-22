import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient, DeleteItemCommand } from '@aws-sdk/client-dynamodb';
import { z } from 'zod/v4';

const client = new DynamoDBClient({});
const tableName = process.env.table_name;

const querySchema = z.object({
  id: z.string().min(1, "Product ID is required"),
});

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const query = querySchema.parse(event.queryStringParameters ?? {});

    const command = new DeleteItemCommand({
      TableName: tableName,
      Key: {
        id: { S: query.id },
      }
    });

    await client.send(command);

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
