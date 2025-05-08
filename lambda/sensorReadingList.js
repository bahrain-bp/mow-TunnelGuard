const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const READINGS_TABLE = process.env.READINGS_TABLE;

exports.handler = async (event) => {
  const sensor_id = event.pathParameters?.sensor_id;

  if (!sensor_id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing sensor_id' }),
    };
  }

  const params = {
    TableName: READINGS_TABLE,
    KeyConditionExpression: 'sensor_id = :sensor_id',
    ExpressionAttributeValues: {
      ':sensor_id': sensor_id,
    },
    Limit: 50, // optional: limit the number of items returned
    ScanIndexForward: true // optional: to get newest first
  };

  try {
    const data = await dynamodb.query(params).promise();
    if (!data.Items || data.Items.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'No readings found for this sensor' }),
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ readings: data.Items }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Unable to fetch readings', details: error.message }),
    };
  }
};