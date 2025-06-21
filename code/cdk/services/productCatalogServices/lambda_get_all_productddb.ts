import { DynamoDBClient, GetItemCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

const client = new DynamoDBClient({});
const tableName = process.env.table_name;

const maxlimit = 20;
const minlimit =0;

async function handler(event:APIGatewayProxyEvent):Promise<APIGatewayProxyResult>{
    let limit = Number(event.queryStringParameters?.limit) || 0;
    let offset: Record<string, any> | undefined = undefined;

    try{
        if(event.queryStringParameters?.offset){
            offset = JSON.parse(decodeURIComponent(event.queryStringParameters.offset));
        }
    }catch{
        offset = undefined;
    }

    limit == 0 ? limit = 20 : limit= Math.min(maxlimit,Math.max(minlimit,limit));
    
    const command = new ScanCommand({
        TableName: tableName,
        Limit: limit,
        ExclusiveStartKey: offset
    })

    try {
        const result = await client.send(command);
        return{
            statusCode: 200,
            body: JSON.stringify({
                items: result.Items,
                nextPageToken: result.LastEvaluatedKey?encodeURI(JSON.stringify(result.LastEvaluatedKey)) : null
            })
        }
    } catch (error) {
        return {
            statusCode: 500,
            body:JSON.stringify(error)
        }
    }


}