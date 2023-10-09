import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

export default async function (event) {
  const { productsTable, stocksTable } = process.env;
  const client = new DynamoDB({})
  const docClient = DynamoDBDocument.from(client);

  const id = event.pathParameters.productId;

  let product, stock;
  try {
    const stocksResponse = await docClient.get({
      TableName: stocksTable,
      Key: {
        product_id: id
      }
    });
    stock = stocksResponse.Item;

    const response = await docClient.get({
      TableName: productsTable,
      Key: {
        id
      }
    });
    product = response.Item;
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to load products"
      })
    };
  }

  if (!product) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        message: "Item not found"
      })
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      ...product,
      count: stock ? stock.count : 0
    })
  };
}