export default async function (event) {
  const { headers, methodArn } = event;
  const { Authorization } = headers;

  if (!Authorization) {
    throw '401';
  }

  const env = process.env;
  const token = Authorization.split(' ')[1];
  if (!token) {
    throw '401';
  }

  let isAuthorized;
  let auth_key = 'guest';
  try {
    const parts = Buffer.from(token, 'base64').toString('utf-8').split(':');
    auth_key = parts[0].toLowerCase();
    isAuthorized = parts.length === 2 && auth_key === 'naggarond' && env[auth_key] === parts[1];
  } catch (e) {
    isAuthorized = false;
  }

  return {
    principalId: auth_key,
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: isAuthorized ? 'Allow' : 'Deny',
          Resource: methodArn
        }
      ]
    }
  };
}