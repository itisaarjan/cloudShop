import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { z } from "zod/v4";
import { withCors } from "../../lib/utils/constants"; 

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
      return withCors(404, { message: "Product not found" });
    }

    return withCors(200, result.Item);

  } catch (error) {
    return withCors(400, {
      message: "Invalid query parameters",
      errors: error instanceof z.ZodError
        ? error.issues
        : error instanceof Error
        ? error.message
        : String(error)
    });
  }
}
