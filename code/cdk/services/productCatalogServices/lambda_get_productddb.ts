import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { z } from "zod/v4";

const client = new DynamoDBClient({});
const tableName = process.env.table_name;

const querySchema = z.object({
  id: z.string().min(1, "id is required"),     
  name: z.string().min(1, "name is required") 
});

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    
    const query = querySchema.parse(event.queryStringParameters ?? {});

    const command = new GetItemCommand({
      TableName: tableName,
      Key: {
        id: { S: query.id },
        name: { S: query.name }
      },
      ConsistentRead: true
    });

    const result = await client.send(command);

    if (!result.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Product not found" })
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS"
      },
      body: JSON.stringify(result.Item)
    };

  } catch (error) {
    if (error instanceof z.ZodError || error instanceof Error) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Invalid query parameters",
          errors: error instanceof z.ZodError ? error.issues : error.message
        })
      };
    }

    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS"
      },
      body: JSON.stringify({
        message: "Internal Server Error",
        error: String(error)
      })
    };
  }
}
