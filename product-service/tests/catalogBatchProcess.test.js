import { vi, expect, describe, test, beforeAll } from 'vitest';

vi.mock('@aws-sdk/client-dynamodb');
vi.mock('@aws-sdk/lib-dynamodb');
vi.mock('@aws-sdk/client-sns');

import catalogBatchProcess from '../functions/catalogBatchProcess';

describe('import product file function', () => {
  const dynamoMock = vi.fn();

  beforeAll(async () => {
    const dynamoDBModule = await import('@aws-sdk/client-dynamodb');
    dynamoDBModule.DynamoDB = class { };

    const dynamoDocumentModule = await import('@aws-sdk/lib-dynamodb');
    dynamoDocumentModule.DynamoDBDocument = class {
      static from() {
        return new this();
      }

      async transactWrite() {
        return dynamoMock();
      }
    };

    const snsModule = await import('@aws-sdk/client-sns');
    snsModule.PublishCommand = class {
      constructor(values) {
        this.commands = values;
      }
    };
    snsModule.SNSClient = class {
      async send(command) {
        this.values = command.commands;

        return new Promise((resolve) => {
          resolve(command.commands);
        })
      }
    };
  });

  test('should return', async () => {
    dynamoMock.mockImplementationOnce(() => new Promise((resolve, reject) => {
      reject('');
    }));
    dynamoMock.mockImplementation(() => new Promise((resolve, reject) => {
      resolve();
    }));

    const event = {
      Records: [
        {
          body: '{"id":"1","title":"title1","price":450,"count":120,"tags":["Melee Infantry"]}'
        },
        {
          body: '{"id":"3","title":"title2","price":1200,"count":100,"tags":["Melee Infantry"]}'
        },
        {
          body: `{"id":"10","title":"title3","price":650,"count":100,"tags":["Melee Infantry"]}`
        }
      ]
    }

    const result = await catalogBatchProcess(event);

    expect(result).toEqual({
      "Message": "This is Message From SNS. Products added 2. Products failed 1.",
      "TopicArn": undefined,
    });
  });
});