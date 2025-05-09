const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const { v7: uuidv7 } = require('uuid');


exports.handler = async (event) => {
    const body = JSON.parse(event.body || '{}');
    
    const sensor_id = uuidv7(); // Generate a new UUID for the tunnel_id
    const tunnel_id = event.pathParameters?.tunnel_id; // Get tunnel_id from the event
    const threshhold_settings = body.threshhold_settings || {Medium: 0, High: 0}; // Default to empty object if not provided
    const type = body.type;

    if (!tunnel_id || !type) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Missing required fields' }),
        };
    }

    const params = {
        TableName: 'Sensors',
        Item: {
            sensor_id: sensor_id,
            tunnel_id: tunnel_id,
            type: type,
            threshhold_settings: threshhold_settings,
        },
    };

    try {
        await dynamoDb.put(params).promise();
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Sensor inserted successfully!' }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Unable to insert sensor', details: error.message }),
        };
    }
}
// Example event object for testing