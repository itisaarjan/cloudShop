import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { z } from "zod/v4";

const client = new DynamoDBClient({});
const tableName = process.env.table_name;

// Constants
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 20;
const MIN_LIMIT = 1;

// Zod schema for query parameters
const querySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => Number(val) || DEFAULT_LIMIT)
    .refine((val) => val >= MIN_LIMIT && val <= MAX_LIMIT, {
      message: `limit must be between ${MIN_LIMIT} and ${MAX_LIMIT}`
    }),
  offset: z
    .string()
    .optional()
    .transform((val) => {
      try {
        return val ? JSON.parse(decodeURIComponent(val)) : undefined;
      } catch {
        throw new Error("Invalid offset format. Must be a URI-encoded JSON object.");
      }
    })
});

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const query = querySchema.parse(event.queryStringParameters ?? {});

    const command = new ScanCommand({
      TableName: tableName,
      Limit: query.limit,
      ExclusiveStartKey: query.offset
    });

    const result = await client.send(command);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS"
      },
      body: JSON.stringify({
        items: result.Items,
        nextPageToken: result.LastEvaluatedKey
          ? encodeURIComponent(JSON.stringify(result.LastEvaluatedKey))
          : null
      })
    };
  } catch (error) {
    if (error instanceof z.ZodError || error instanceof Error) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*",
          "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS"
        },
        body: JSON.stringify({
          message: "Invalid query parameters",
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

