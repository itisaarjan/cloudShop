import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";


const client=new DynamoDBClient({});
const tableName=process.env.table_name;


async function handler(event:APIGatewayProxyEvent): Promise<APIGatewayProxyResult>{
   const id = event.queryStringParameters?.id;
   const name = event.queryStringParameters?.name;


   if(!id || !name){
       return {
           statusCode: 480,
           body: "Both id and name are required"
       }
   };


   const command= new GetItemCommand({
       TableName: tableName,
       Key:{
           id: {S: id},
           name: {S: name}
       },
       ConsistentRead:true
   });


   try{
       const result = await client.send(command);
       return {
           statusCode: 200,
           body: JSON.stringify(result.Item)
       }
   }catch(error){
       return {
           statusCode: 500,
           body: JSON.stringify(error)
       }
   }
}


export {handler};
