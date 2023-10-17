import { vi, expect, describe, test } from 'vitest';

vi.mock('@aws-sdk/s3-request-presigner');

import productFile from '../functions/importProductsFile';

describe('import product file function', () => {
  test('should return', async () => {
    const signedMock = vi.fn();
    signedMock.mockImplementation(() => {
      return 3
    });

    const client = await import('@aws-sdk/s3-request-presigner')
    client.getSignedUrl = signedMock;

    const event = {
      queryStringParameters: {
        name: 'testName'
      }
    }

    const result = await productFile(event)

    expect(result.statusCode).toEqual(200)
  });

  test('should throw error', async () => {
    const signedMock = vi.fn();
    signedMock.mockImplementation(() => {
      throw 'error';
    });

    const client = await import('@aws-sdk/s3-request-presigner')
    client.getSignedUrl = signedMock;

    const event = {
      queryStringParameters: {
        name: 'testName'
      }
    }

    const result = await productFile(event)

    expect(result.statusCode).toEqual(500)
  })
});