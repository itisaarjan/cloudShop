import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";


const client= new DynamoDBClient({});
const tableName=process.env.table_name;



export async function handler (event: APIGatewayProxyEvent):Promise<APIGatewayProxyResult> {
    if(!event.body){
        return{
            statusCode: 400,
            body: JSON.stringify({ message: "Request body is required" })
        }
    }

    const product = JSON.parse(event.body);

    if(!product.id){
        return{
            statusCode: 400,
            body: JSON.stringify({message: "Product ID is required"})
        }
    }

    const command = new UpdateItemCommand({
  TableName: tableName,
  Key: {
    id: { S: product.id }
  },
  UpdateExpression: "SET #name = :name, #description = :description, #price = :price, #stock = :stock, #category = :category",
  ExpressionAttributeNames: {
    "#name": "name",
    "#description": "description",
    "#price": "price",
    "#stock": "stock",
    "#category": "category"
  },
  ExpressionAttributeValues: {
    ":name": { S: product.name },
    ":description": { S: product.description },
    ":price": { N: product.price.toString() },
    ":stock": { N: product.stock.toString() },
    ":category": { S: product.category }
  },
  ReturnValues: "ALL_NEW"
});

try {
    const result= await client.send(command);
    return {
        statusCode: 200,
        body:JSON.stringify({
            message: "Product updated successfully",
            product: result.Attributes
        })
    }
} catch (error) {
    return {
        statusCode: 500,
        body: JSON.stringify({
            message: "Error updating product",
            error: error
        })  
    }
}
}