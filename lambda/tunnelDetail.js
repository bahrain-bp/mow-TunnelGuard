const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const TUNNELS_TABLE = process.env.TUNNELS_TABLE; // Ensure this environment variable is set in your Lambda function configuration

exports.handler = async (event) => {
    const tunnelId = event.pathParameters.tunnel_id; // Extract tunnel_id from the path parameters

    const params = {
        TableName: TUNNELS_TABLE,
        Key: {
            tunnel_id: tunnelId,
        },
    };

    try {
        const data = await dynamoDB.get(params).promise();
        if (!data.Item) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'Tunnel not found' }),
            };
        }
        return {
            statusCode: 200,
            body: JSON.stringify(data.Item),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Unable to retrieve tunnel', details: error.message }),
        };
    }
}