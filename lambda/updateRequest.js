const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const REQUESTS_TABLE = process.env.REQUESTS_TABLE;

exports.handler = async (event) => {
    const request_id = event.pathParameters?.request_id;
    const created_at = event.pathParameters?.created_at;
    const body = JSON.parse(event.body || '{}');

    const acknowledged_by = body.acknowledged_by;
    const actions = body.actions || []; // Default to an empty array if actions are not provided

    if (!request_id || !created_at || !acknowledged_by) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: 'Missing required fields: request_id, created_at, acknowledged_by'
            }),
        };
    }

    const acknowledged_at = new Date().toISOString();

    const params = {
        TableName: REQUESTS_TABLE,
        Key: {
            request_id,
            created_at
        },
        UpdateExpression: `
            SET acknowledged = :ack,
                acknowledged_by = :by,
                acknowledged_at = :at,
                actions = :actions
        `,
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
            body: JSON.stringify({ error: 'Unable to update request', details: error.message }),
        };
    }
};