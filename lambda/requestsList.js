const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const REQUESTS_TABLE = process.env.REQUESTS_TABLE;

exports.handler = async () => {
  const params = {
    TableName: REQUESTS_TABLE,
    Limit: 50, // Optional limit
    ScanIndexForward: true // optional: to get newest first
  };

  try {
    const data = await dynamodb.scan(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({ requests: data.Items }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Unable to fetch requests', details: error.message }),
    };
  }
};