// const AWS = require('aws-sdk');
// const dynamoDB = new AWS.DynamoDB.DocumentClient();
// const TUNNELS_TABLE = process.env.TUNNELS_TABLE; // Ensure this environment variable is set in your Lambda function configuration

// exports.handler = async (event) => {
//     const tunnelId = event.pathParameters.tunnel_id; // Extract tunnel_id from the path parameters

//     const params = {
//         TableName: TUNNELS_TABLE,
//         Key: {
//             tunnel_id: tunnelId,
//         },
//     };

//     try {
//         const data = await dynamoDB.get(params).promise();
//         if (!data.Item) {
//             return {
//                 statusCode: 404,
//                 body: JSON.stringify({ error: 'Tunnel not found' }),
//             };
//         }
//         return {
//             statusCode: 200,
//             body: JSON.stringify(data.Item),
//         };
//     } catch (error) {
//         return {
//             statusCode: 500,
//             body: JSON.stringify({ error: 'Unable to retrieve tunnel', details: error.message }),
//         };
//     }
// }

const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const TUNNELS_TABLE = process.env.TUNNELS_TABLE;
const SENSORS_TABLE = process.env.SENSORS_TABLE;
const SENSOR_READINGS_TABLE = process.env.SENSOR_READINGS_TABLE;

exports.handler = async (event) => {
  const tunnel_id = event.pathParameters?.tunnel_id;

  console.log("TUNNELS_TABLE =", TUNNELS_TABLE);
    console.log("SENSORS_TABLE =", SENSORS_TABLE);
    console.log("SENSOR_READINGS_TABLE =", SENSOR_READINGS_TABLE);

  if (!tunnel_id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing tunnel_id' }),
    };
  }

  try {
    // 1. Get tunnel
    const tunnelResult = await dynamoDB.get({
      TableName: TUNNELS_TABLE,
      Key: { tunnel_id }
    }).promise();

    if (!tunnelResult.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Tunnel not found' }),
      };
    }

    const tunnel = tunnelResult.Item;

    // 2. Get sensors for tunnel (requires GSI on tunnel_id or SK pattern)
    const sensorsResult = await dynamoDB.query({
      TableName: SENSORS_TABLE,
      IndexName: 'TunnelIdIndex', // must exist if tunnel_id is not PK
      KeyConditionExpression: 'tunnel_id = :tid',
      ExpressionAttributeValues: {
        ':tid': tunnel_id
      }
    }).promise();

    const sensors = sensorsResult.Items || [];

    // 3. For each sensor, get latest reading
    const sensorsWithReadings = await Promise.all(sensors.map(async (sensor) => {
      const readingResult = await dynamoDB.query({
        TableName: SENSOR_READINGS_TABLE,
        KeyConditionExpression: 'sensor_id = :sid',
        ExpressionAttributeValues: {
          ':sid': sensor.sensor_id
        },
        ScanIndexForward: false, // latest first
        Limit: 1
      }).promise();

      const latestReading = readingResult.Items?.[0]?.sensor_reading ?? null;

      return {
        sensor_id: sensor.sensor_id,
        type: sensor.type,
        latest_reading: latestReading
      };
    }));

    // 4. Build final response
    return {
      statusCode: 200,
      body: JSON.stringify({
        tunnel,
        sensors: sensorsWithReadings
      })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to retrieve tunnel details', details: error.message }),
    };
  }
};