import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { PutItemCommand } from '@aws-sdk/client-dynamodb';
const client= new DynamoDBClient({});
const tableName=process.env.table_name;

interface Product{
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
}

function validateAllProps(product: Product): boolean {
    return product.id && product.name && product.description && product.price?true:false && product.stock?true:false && product.category;
}

export async function handler(event:APIGatewayProxyEvent):Promise<APIGatewayProxyResult>{
    if (!event.body) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Request body is required" })
        };
    }
    const product:Product= JSON.parse(event.body);

    if(!validateAllProps(product)){
        return {
            statusCode: 400,
            body: JSON.stringify({message: "All properties are required"})
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
    category: { S: product.category }       
  }
});

    try {
        const result = await client.send(command);
        return {
            statusCode: 201,
            body: JSON.stringify({
                message: "Product created successfully",
                product: product
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Error creating product",
                error: error
            })
        }
    }
    



}