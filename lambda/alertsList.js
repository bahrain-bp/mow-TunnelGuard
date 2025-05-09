const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const ALERTS_TABLE = process.env.ALERTS_TABLE;

exports.handler = async (event) => {
  const statusFilter = event.queryStringParameters?.status || null;
  const params = {
    TableName: ALERTS_TABLE,
    ProjectionExpression: "alert_id, created_at, tunnel_id, type, acknowledged", // Specify the attributes you want to retrieve
    Limit: 50, // Optional limit
    ScanIndexForward: true // optional: to get newest first
  };

  if (statusFilter == 'acknowledged') {
    params.FilterExpression = "acknowledged = :acknowledged";
    params.ExpressionAttributeValues = {
      ":acknowledged": true
    };
  }
    else if (statusFilter == null) {
      params.FilterExpression = "acknowledged = :acknowledged";
      params.ExpressionAttributeValues = {
        ":acknowledged": false
      };
    }

  try {
    const data = await dynamodb.scan(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({ alerts: data.Items }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Unable to fetch alerts', details: error.message }),
    };
  }
};