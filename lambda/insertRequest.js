const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const { v7: uuidv7 } = require('uuid');


exports.handler = async (event) => {
    const request_id = uuidv7(); // Generate a new UUID for the request_id
    const created_at = new Date().toISOString(); // Current date and time in ISO format
    const description = event.description; // Get description from the event
    const acknowledged = false; // Default value for acknowledged
    const acknowledged_by = null; // Default value for acknowledged_by
    const acknowledged_at = null; // Default value for acknowledged_at
    const actions = event.actions || []; // Default to empty array if not provided

    const params = {
        TableName: 'Requests',
        Item: {
            request_id: request_id,
            created_at: created_at,
            description: description,
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
            body: JSON.stringify({ message: 'Request inserted successfully!' }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Unable to insert request', details: error.message }),
        };
    }
    
}
