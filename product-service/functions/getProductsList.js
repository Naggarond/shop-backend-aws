import { DynamoDB, ScanCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb"

export default async function (event) {
  const { productsTable, stocksTable } = process.env;
  const client = new DynamoDB({})
  const docClient = DynamoDBDocument.from(client);

  let stocksResponse, response;
  try {
    stocksResponse = await docClient.send(new ScanCommand({
      TableName: stocksTable,
      ConsistentRead: true
    }));
    response = await docClient.send(new ScanCommand({
      TableName: productsTable,
      ConsistentRead: true
    }));
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error with access DB'
      })
    };
  }

  const stockItems = stocksResponse.Items.map(item => unmarshall(item));
  const result = response.Items.map(item => {
    const product = unmarshall(item);
    const stocksInfo = stockItems.find(item => item.product_id === product.id);

    return {
      ...product,
      count: stocksInfo ? stocksInfo.count : 0
    };
  });

  return {
    statusCode: 200,
    body: JSON.stringify(result)
  };
}
