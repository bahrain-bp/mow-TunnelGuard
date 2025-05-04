const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const AUDIT_LOGS_TABLE = process.env.AUDIT_LOGS_TABLE;

exports.handler = async (event) => {
  const log_id = event.pathParameters?.logId;

  if (!log_id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing log_id' }),
    };
  }

  const params = {
    TableName: AUDIT_LOGS_TABLE,
    Key: {
      log_id,
    },
  };

  try {
    const data = await dynamodb.get(params).promise();

    if (!data.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Log not found' }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(data.Item),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Unable to fetch log', details: error.message }),
    };
  }
};