const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const READINGS_TABLE = process.env.READINGS_TABLE;

exports.handler = async (event) => {
  const sensor_id = event.pathParameters?.sensor_id;
  const read_at = event.pathParameters?.read_at;

  if (!sensor_id || !read_at) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing sensor_id or read_at' }),
    };
  }

  const params = {
    TableName: READINGS_TABLE,
    Key: {
      sensor_id,
      read_at,
    },
  };

  try {
    const data = await dynamodb.get(params).promise();
    if (!data.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Reading not found' }),
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify(data.Item),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Unable to fetch reading', details: error.message }),
    };
  }
};