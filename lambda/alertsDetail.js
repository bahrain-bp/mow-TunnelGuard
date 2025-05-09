const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const ALERTS_TABLE = process.env.ALERTS_TABLE;

exports.handler = async (event) => {
  const alert_id = event.pathParameters?.alert_id;
  const created_at = event.pathParameters?.created_at;

  if (!alert_id || !created_at) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing alert_id or created_at' }),
    };
  }

  const params = {
    TableName: ALERTS_TABLE,
    Key: {
      alert_id,
      created_at
    },
  };

  try {
    const data = await dynamodb.get(params).promise();
    if (!data.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Alert not found' }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(data.Item),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Unable to fetch alert', details: error.message }),
    };
  }
};