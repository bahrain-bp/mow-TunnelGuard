const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const ALERTS_TABLE = process.env.ALERTS_TABLE;

exports.handler = async (event) => {
    const alert_id = event.pathParameters?.alert_id;
    const created_at = event.pathParameters?.created_at; // This is not used in the update, but you might want to validate it
    const body = JSON.parse(event.body || '{}');

    const acknowledged_by = body.acknowledged_by;
    const actions = body.actions || []; // Default to an empty array if actions are not provided

    if (!alert_id || !acknowledged_by || !created_at) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Missing required fields: alert_id, created_at, acknowledged_by' }),
        };
    }

    const acknowledged_at = new Date().toISOString();

    const params = {
        TableName: ALERTS_TABLE,
        Key: { alert_id, created_at },
        UpdateExpression: `SET acknowledged = :ack, acknowledged_by = :by, acknowledged_at = :at, actions = :actions`,
        ExpressionAttributeValues: {
            ':ack': true,
            ':by': acknowledged_by,
            ':at': acknowledged_at,
            ':actions': actions
        },
        ReturnValues: 'ALL_NEW'
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
            body: JSON.stringify({ error: 'Unable to update alert', details: error.message }),
        };
    }
};