const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const { v7: uuidv7 } = require('uuid');


exports.handler = async (event) => {
    const log_id = uuidv7(); // Generate a new UUID for the log_id
    const created_at = new Date().toISOString(); // Current date and time in ISO format
    const description = event.description; // Get description from the event
    const user_id = event.user_id; // Get user_id from the event

    const params = {
        TableName: 'AuditLogs',
        Item: {
            log_id: log_id,
            created_at: created_at,
            description: description,
            user_id: user_id,
        },
    };
    
        try {
            await dynamoDb.put(params).promise();
            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'Audit log inserted successfully!' }),
            };
        } catch (error) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Unable to insert audit log', details: error.message }),
            };
        }
        
}
