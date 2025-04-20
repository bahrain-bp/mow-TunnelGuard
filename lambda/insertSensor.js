const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const { v7: uuidv7 } = require('uuid');


exports.handler = async (event) => {
    const sensor_id = uuidv7(); // Generate a new UUID for the tunnel_id
    const tunnel_id = event.tunnel_id; // Get tunnel_id from the event
    const threshhold_settings = event.threshhold_settings || {Medium: 0, High: 0}; // Default to empty object if not provided
    const type = event.type; // Default to "Unknown" if not provided

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