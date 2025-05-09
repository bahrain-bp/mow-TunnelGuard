const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const SENSORS_TABLE = process.env.SENSORS_TABLE;

exports.handler = async (event) => {
    const sensor_id = event.pathParameters?.sensor_id;
    const body = JSON.parse(event.body || '{}');

    const tunnel_id = body.tunnel_id;
    const type = body.type;
    const threshhold_settings = body.threshhold_settings;

    if (!sensor_id || !type || !threshhold_settings) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Missing required fields: sensor_id, tunnel_id, type, or threshhold_settings' }),
        };
    }

    const params = {
        TableName: SENSORS_TABLE,
        Key: {
            sensor_id,
            tunnel_id
        },
        UpdateExpression: "SET #type = :type, threshhold_settings = :settings",
        ExpressionAttributeNames: {
            "#type": "type"
        },
        ExpressionAttributeValues: {
            ":type": type,
            ":settings": threshhold_settings
        },
        ReturnValues: "ALL_NEW"
    };

    try {
        const result = await dynamoDb.update(params).promise();
        return {
            statusCode: 200,
            body: JSON.stringify({ updated: result.Attributes }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Unable to update sensor', details: error.message }),
        };
    }
};