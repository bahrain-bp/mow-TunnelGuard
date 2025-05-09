const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const REQUESTS_TABLE = process.env.REQUESTS_TABLE;

exports.handler = async (event) => {
  const request_id = event.pathParameters?.requestId;
  const created_at = event.pathParameters?.created_at;

  if (!request_id || !created_at) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing request_id, or created_at' }),
    };
  }

  const params = {
    TableName: REQUESTS_TABLE,
    Key: {
      request_id,
      created_at,
    },
  };

  try {
    const data = await dynamodb.get(params).promise();

    if (!data.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Request not found' }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(data.Item),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Unable to fetch request', details: error.message }),
    };
  }
};
