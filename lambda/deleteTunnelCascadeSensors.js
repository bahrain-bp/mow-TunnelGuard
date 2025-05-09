const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const TUNNELS_TABLE = process.env.TUNNELS_TABLE;
const SENSORS_TABLE = process.env.SENSORS_TABLE;

exports.handler = async (event) => {
    const tunnel_id = event.pathParameters?.tunnel_id;

    if (!tunnel_id) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Missing tunnel_id in path parameters' }),
        };
    }

    try {
        // 1. Query all sensors with this tunnel_id
        const sensorQueryParams = {
            TableName: SENSORS_TABLE,
            IndexName: 'TunnelIdIndex', // assumes a GSI on tunnel_id
            KeyConditionExpression: 'tunnel_id = :tid',
            ExpressionAttributeValues: {
                ':tid': tunnel_id
            }
        };

        const sensorsResult = await dynamoDb.query(sensorQueryParams).promise();
        const sensors = sensorsResult.Items || [];

        // 2. Delete all sensors
        for (const sensor of sensors) {
            await dynamoDb.delete({
                TableName: SENSORS_TABLE,
                Key: {
                    sensor_id: sensor.sensor_id,
                    tunnel_id: sensor.tunnel_id // required if SK exists
                }
            }).promise();
        }

        // 3. Delete the tunnel
        const tunnelDeleteResult = await dynamoDb.delete({
            TableName: TUNNELS_TABLE,
            Key: {
                tunnel_id
            },
            ReturnValues: 'ALL_OLD'
        }).promise();

        if (!tunnelDeleteResult.Attributes) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'Tunnel not found' }),
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Tunnel and associated sensors deleted successfully',
                deleted_tunnel: tunnelDeleteResult.Attributes,
                deleted_sensors_count: sensors.length
            }),
        };

    } catch (error) {
        console.error('Error deleting tunnel and sensors:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to delete tunnel or sensors', details: error.message }),
        };
    }
};