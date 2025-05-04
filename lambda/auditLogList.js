const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const AUDIT_LOGS_TABLE = process.env.AUDIT_LOGS_TABLE; // Ensure this environment variable is set in your Lambda function configuration

exports.handler = async (event) => {
    const params = {
        TableName: AUDIT_LOGS_TABLE,
        Limit: 200, // Adjust the limit as needed
        ScanIndexForward: true // optional: to get newest first
    };

    try {
        const data = await dynamoDB.scan(params).promise();
        if (!data.Items || data.Items.length === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'No audit logs found' }),
            };
        }
        return {
            statusCode: 200,
            body: JSON.stringify(data.Items),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Unable to retrieve audit logs', details: error.message }),
        };
    }
}
// This code defines an AWS Lambda function that retrieves audit logs from a DynamoDB table.