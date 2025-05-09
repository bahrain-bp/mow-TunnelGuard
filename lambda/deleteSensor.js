const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const SENSORS_TABLE = process.env.SENSORS_TABLE;

exports.handler = async (event) => {
  const sensor_id = event.pathParameters?.sensor_id;

  if (!sensor_id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing sensor_id' }),
    };
  }

  // Step 1: Query using sensor_id (requires a GSI)
  const queryParams = {
    TableName: SENSORS_TABLE,
    IndexName: 'SensorIdIndex', // You must create this GSI
    KeyConditionExpression: 'sensor_id = :sid',
    ExpressionAttributeValues: {
      ':sid': sensor_id
    }
  };

  try {
    const result = await dynamoDb.query(queryParams).promise();

    if (!result.Items || result.Items.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Sensor not found' }),
      };
    }

    const item = result.Items[0];

    // Step 2: Delete using both PK and SK
    await dynamoDb.delete({
      TableName: SENSORS_TABLE,
      Key: {
        sensor_id: item.sensor_id,
        tunnel_id: item.tunnel_id
      }
    }).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Sensor deleted successfully' }),
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to delete sensor', details: error.message }),
    };
  }
};