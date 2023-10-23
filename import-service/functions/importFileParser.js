import { S3Client, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { GetQueueUrlCommand, SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { Upload } from '@aws-sdk/lib-storage';
import csv from 'csv-parser';
import { PassThrough } from 'stream';

const BUCKET_NAME = 'shop-aws-task-5-container';

export default async function (event) {
  const { queue } = process.env;
  const client = new S3Client();
  const sqsClient = new SQSClient();

  let queueUrl;
  try {
    const response = await sqsClient.send(
      new GetQueueUrlCommand({
        QueueName: queue
      })
    );
    queueUrl = response.QueueUrl;
  } catch (e) {

    console.log('getUrlError', e);
    return
  }

  for (const record of event.Records) {
    const fileName = record.s3.object.key.split('/')[1]
    const { Body } = await client.send(new GetObjectCommand({
      Key: `uploaded/${fileName}`,
      Bucket: BUCKET_NAME
    }))

    // reading
    Body.pipe(csv())
      .on('data', (chunk) => {
        sqsClient.send(
          new SendMessageCommand({
            QueueUrl: queueUrl,
            MessageBody: JSON.stringify(chunk)
          })
        );
      })
      .on('end', () => {
        console.log('write ended')
      });

    // echo
    const writeStream = new PassThrough();
    Body.pipe(writeStream)

    const target = {
      Key: `parsed/${fileName}`,
      Bucket: BUCKET_NAME,
      Body: writeStream
    };
    try {
      const uploader = new Upload({
        client,
        params: target
      });

      await uploader.done();
    } catch (e) {
      console.log(e);
    }

    await client.send(
      new DeleteObjectCommand({
        Key: `uploaded/${fileName}`,
        Bucket: BUCKET_NAME,
      })
    )

    console.log(`Parsed file ${fileName}`)
  }
}