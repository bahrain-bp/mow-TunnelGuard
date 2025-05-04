const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const SENSORS_TABLE = process.env.SENSORS_TABLE; // Ensure this environment variable is set in your Lambda function configuration

exports.handler = async (event) => {
    const tunnel_id = event.pathParameters?.tunnel_id; // Extract tunnel_id from the path parameters

    const params = {
        TableName: SENSORS_TABLE,

        IndexName: 'TunnelIdIndex', // Use the correct index name if needed
        KeyConditionExpression: 'tunnel_id = :tunnel_id',
        ExpressionAttributeValues: {
            ':tunnel_id': tunnel_id,
        },

    };

    console.log("Querying with params:", JSON.stringify(params));

    try {
        const data = await dynamoDB.query(params).promise();
        console.log("DynamoDB query result:", data);

        if (!data.Items || data.Items.length === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'no sensors found' }),
            };
        }
        return {
            statusCode: 200,
            body: JSON.stringify(data.Items),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Unable to retrieve sensor', details: error.message }),
        };
    }
}