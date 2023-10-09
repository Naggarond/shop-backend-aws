import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { v4 as uuid } from "uuid";

import items from "./../mocks/products.json" assert { type: "json" };

const Products = [],
  Stocks = [];

items.forEach(item => {
  const id = uuid();

  Products.push({
    id,
    title: item.title,
    description: item.description,
    price: item.price
  });

  Stocks.push({
    product_id: id,
    count: item.count
  });
})

const client = new DynamoDB({})
const ddbDocClient = DynamoDBDocument.from(client);

Products.forEach(async product => {
  await ddbDocClient.put({
    TableName: 'products',
    Item: product
  });
});

Stocks.forEach(async stock => {
  await ddbDocClient.put({
    TableName: 'stocks',
    Item: stock
  });
});


ddbDocClient.destroy();
client.destroy();

console.log('Tables populated');