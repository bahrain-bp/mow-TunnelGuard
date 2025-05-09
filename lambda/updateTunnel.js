const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const TUNNELS_TABLE = process.env.TUNNELS_TABLE;

exports.handler = async (event) => {
  const tunnel_id = event.pathParameters?.tunnel_id;
  const body = JSON.parse(event.body || '{}');

  if (!tunnel_id || !body.name || !body.location || body.threshhold === undefined) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing required fields' }),
    };
  }

  const params = {
    TableName: TUNNELS_TABLE,
    Key: { tunnel_id },
    UpdateExpression: "SET #nm = :name, #loc = :location, threshhold = :threshhold",
    ExpressionAttributeNames: {
        "#nm": "name",
        "#loc": "location",

    },
    ExpressionAttributeValues: {
        ":name": body.name,
        ":location": body.location,
        ":threshhold": body.threshhold
    },
    ReturnValues: "ALL_NEW"
  };

  try {
    const result = await dynamodb.update(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({ updated: result.Attributes }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to update tunnel', details: error.message }),
    };
  }
};