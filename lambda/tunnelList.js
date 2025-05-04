const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const TUNNELS_TABLE = process.env.TUNNELS_TABLE;

exports.handler = async (event) => {
    const params = {
        TableName: TUNNELS_TABLE,
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