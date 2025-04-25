const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const { v7: uuidv7 } = require('uuid');


exports.handler = async (event) => {
    const alert_id = uuidv7(); // Generate a new UUID for the alert_id
    const created_at = new Date().toISOString(); // Current date and time in ISO format
    const tunnel_id = event.tunnel_id; // Get tunnel_id from the event
    const type = event.type; // Get type from the event
    const sensor_reading = event.sensor_reading; // Get sensor_reading from the event
    const sensor_id = event.sensor_id; // Get sensor_id from the event
    const acknowledged = false; // Default value for acknowledged
    const acknowledged_by = null; // Default value for acknowledged_by
    const acknowledged_at = null; // Default value for acknowledged_at
    const actions = event.actions || []; // Default to empty array if not provided

    const params = {
        TableName: 'Alerts',
        Item: {
            alert_id: alert_id,
            created_at: created_at,
            tunnel_id: tunnel_id,
            type: type,
            sensor_reading: sensor_reading,
            sensor_id: sensor_id,
            acknowledged: acknowledged,
            acknowledged_by: acknowledged_by,
            acknowledged_at: acknowledged_at,
            actions: actions
        },
    };

    try {
        await dynamoDb.put(params).promise();
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Alert inserted successfully!' }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Unable to insert alert', details: error.message }),
        };
    }
    
}