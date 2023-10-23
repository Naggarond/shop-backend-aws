import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { v4 as uuid } from "uuid";
import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";

export default async function (event) {
  const snsClient = new SNSClient({});
  const { productsTable, stocksTable, topic } = process.env;
  const client = new DynamoDB({})
  const docClient = DynamoDBDocument.from(client);

  let positive = 0,
    negative = 0;

  for (const record of event.Records) {
    const { title, description, price, count } = JSON.parse(record.body)
    const id = uuid();
    try {
      await docClient.transactWrite({
        TransactItems: [
          {
            Put: {
              Item: {
                id,
                title,
                description,
                price
              },
              TableName: productsTable
            }
          },
          {
            Put: {
              Item: {
                product_id: id,
                count
              },
              TableName: stocksTable
            }
          }
        ]
      });

      positive++;
    } catch (e) {
      negative++;
    }
  }
  const response = await snsClient.send(
    new PublishCommand({
      Message: `This is Message From SNS. Products added ${positive}. Products failed ${negative}.`,
      TopicArn: topic
    })
  );

  console.log(response);
  return response;
}