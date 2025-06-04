import { DynamoDB } from 'aws-sdk';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const docClient = new DynamoDB.DocumentClient();
export const tableName = process.env.TABLE_NAME || 'ProductCatalog';

interface Product {
    productId: string;
    name: string;
    description: string;
    price: number;
    category: string;
    stock: number;
    ttl?: number; 
    createdAt?: string; 
    updatedAt?: string; 
}

function validateProduct(product: Partial<Product>): string | null {
    if (!product.productId) return 'productId is required';
    if (!product.name) return 'name is required';
    if (!product.description) return 'description is required';
    if (typeof product.price !== 'number' || product.price < 0) return 'price must be a non-negative number';
    if (!product.category) return 'category is required';
    if (typeof product.stock !== 'number' || product.stock < 0) return 'stock must be a non-negative number';
    return null;
}

async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    console.log('Received event:', JSON.stringify(event, null, 2));

    try {
        const httpMethod = event.httpMethod;
        const path = event.path;
        const productId: string | undefined = event.pathParameters?.productId;

        switch (httpMethod) {
            case 'GET':
                if (productId) {
                    const result = await docClient.get({
                        TableName: tableName,
                        Key: { productId }
                    }).promise();
                    if (!result.Item) {
                        return { statusCode: 404, body: JSON.stringify({ message: 'Product not found' }) };
                    }
                    return { statusCode: 200, body: JSON.stringify(result.Item) };
                } else {
                    const data = await docClient.scan({ TableName: tableName }).promise();
                    return { statusCode: 200, body: JSON.stringify(data.Items) };
                }

            case 'POST':
                const newProduct: Product = JSON.parse(event.body || '{}');
                const validationError = validateProduct(newProduct);
                if (validationError) {
                    return { statusCode: 400, body: JSON.stringify({ message: validationError }) };
                }
                newProduct.ttl = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30;
                newProduct.createdAt = new Date().toISOString();
                newProduct.updatedAt = new Date().toISOString();
                await docClient.put({ TableName: tableName, Item: newProduct }).promise();
                return { statusCode: 201, body: JSON.stringify(newProduct) };

            case 'PUT':
                if (!productId) {
                    return { statusCode: 400, body: JSON.stringify({ message: 'Product ID is required in path' }) };
                }
                const updatedProduct: Product = JSON.parse(event.body || '{}');
                const updateError = validateProduct(updatedProduct);
                if (updateError) {
                    return { statusCode: 400, body: JSON.stringify({ message: updateError }) };
                }
                updatedProduct.updatedAt = new Date().toISOString();
                await docClient.update({
                    TableName: tableName,
                    Key: { productId },
                    UpdateExpression: 'set #name = :name, #description = :description, #price = :price, #category = :category, #stock = :stock, #updatedAt = :updatedAt',
                    ExpressionAttributeNames: {
                        '#name': 'name',
                        '#description': 'description',
                        '#price': 'price',
                        '#category': 'category',
                        '#stock': 'stock',
                        '#updatedAt': 'updatedAt'
                    },
                    ExpressionAttributeValues: {
                        ':name': updatedProduct.name,
                        ':description': updatedProduct.description,
                        ':price': updatedProduct.price,
                        ':category': updatedProduct.category,
                        ':stock': updatedProduct.stock,
                        ':updatedAt': updatedProduct.updatedAt
                    }
                }).promise();
                return { statusCode: 200, body: JSON.stringify({ message: 'Product updated' }) };

            case 'DELETE':
                if (!productId) {
                    return { statusCode: 400, body: JSON.stringify({ message: 'Product ID is required in path' }) };
                }
                await docClient.delete({ TableName: tableName, Key: { productId } }).promise();
                return { statusCode: 204, body: '' };

            default:
                return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) };
        }

    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error', error: (error as Error).message })
        };
    }
}
export { handler };
// This code is a Lambda function handler for managing products in a DynamoDB table.
// It supports CRUD operations: Create, Read, Update, and Delete.
// The handler processes HTTP requests and interacts with DynamoDB using the AWS SDK.
// It validates product data, handles errors, and returns appropriate HTTP responses.
// The function is designed to be deployed in an AWS Lambda environment and is triggered by API Gateway events.
// The product data includes fields like productId, name, description, price, category, stock, and timestamps for creation and updates.