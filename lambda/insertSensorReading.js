const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();


exports.handler = async (event) => {
    const sensor_id = event.sensor_id; // Get sensor_id from the event
    const read_at = new Date().toISOString(); // Current date and time in ISO format
    const sensor_reading = event.sensor_reading; // Get sensor_reading from the event

    const params = {
        TableName: 'SensorReadings',
        Item: {
            sensor_id: sensor_id,
            read_at: read_at,
            sensor_reading: sensor_reading,
        },
    };

    try {
        await dynamoDb.put(params).promise();
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Sensor reading inserted successfully!' }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Unable to insert sensor reading', details: error.message }),
        };
    }

}