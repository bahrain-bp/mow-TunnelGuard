const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const SENSORS_TABLE = process.env.SENSORS_TABLE; // Ensure this environment variable is set in your Lambda function configuration

exports.handler = async (event) => {
    const sensorId = event.pathParameters.sensor_id; // Extract sensor_id from the path parameters

    const params = {
        TableName: SENSORS_TABLE,
        IndexName: 'SensorIdIndex', // Use the correct index name if needed
        KeyConditionExpression: 'sensor_id = :sensor_id',
        ExpressionAttributeValues: {
            ':sensor_id': sensorId
        }
    };

    try {
        const data = await dynamoDB.query(params).promise();
        if (!data.Items || data.Items.length === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'Sensor not found' }),
            };
        }
        return {
            statusCode: 200,
            body: JSON.stringify(data.Items),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Unable to retrieve sensor', details: error.message }),
        };
    }
}