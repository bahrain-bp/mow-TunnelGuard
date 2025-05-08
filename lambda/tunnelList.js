const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const TUNNELS_TABLE = process.env.TUNNELS_TABLE;

exports.handler = async (event) => {
    const params = {
        TableName: TUNNELS_TABLE,
        ProjectionExpression: 'tunnel_id, #nm, #loc, #st, last_status_time',
        ExpressionAttributeNames: {
            "#nm": "name",
            "#loc": "location",
            "#st": "status",
        } // Specify the attributes you want to retrieve
    };

    try {
        const data = await dynamoDB.scan(params).promise();
        return {
            statusCode: 200,
            body: JSON.stringify(data.Items),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Unable to retrieve tunnels', details: error.message }),
        };
    }
}