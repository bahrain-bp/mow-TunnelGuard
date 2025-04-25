const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const { v7: uuidv7 } = require('uuid');


exports.handler = async (event) => {
    const tunnel_id = uuidv7(); // Generate a new UUID for the tunnel_id
    const name = event.name;
    const location = event.location;
    const threshhold = event.threshhold;
    const status = "Safe"; // Default value for tunnelStatus
    const last_status_time = new Date().toISOString(); // Current date and time in ISO format
    const barrier_state = false; // Default value for tunnelBarrierStatus

    const params = {
        TableName: 'Tunnels',
        Item: {
            tunnel_id: tunnel_id,
            name: name,
            location: location,
            threshhold: threshhold,
            status: status,
            last_status_time: last_status_time,
            barrier_state: barrier_state
        },
    };

    try {
        await dynamoDb.put(params).promise();
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Tunnel inserted successfully!' }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Unable to insert tunnel', details: error.message }),
        };
    }
}
// Example event object for testing
