const {DynamoDBClient, DeleteCommand} = require('@aws-sdk/lib-dynamodb');
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
const client = new DynamoDBClient({});
const tableName = process.env.table_name;
async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    if(!event.queryStringParameters || !event.queryStringParameters.id) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Product ID is required" })
        };
    }
    const productId = event.queryStringParameters.id;
    const command = new DeleteCommand({
        TableName: tableName,
        Key: {
            id: productId
        }});

        try {
            const result = await client.send(command);
            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: "Product deleted successfully",
                    productId: productId
                })
            };  
        } catch (error) {
            return{
                statusCode: 500,
                body: JSON.stringify({
                    message: "Error deleting product",
                    error: error
                })  
            }
        }
}

export { handler };