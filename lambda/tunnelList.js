const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const TUNNELS_TABLE = process.env.TUNNELS_TABLE;

exports.handler = async (event) => {
    const params = {
        TableName: TUNNELS_TABLE,
        ProjectionExpression: 'tunnel_id, #nm, #st, threshhold, last_status_time',
        ExpressionAttributeNames: {
            "#nm": "name",
            "#st": "status",
        } // Specify the attributes you want to retrieve
    };

    try {
        const data = await dynamoDB.scan(params).promise();
        const tunnels = data.Items || [];
    
        // Summary counts
        const summary = {
          total: tunnels.length,
          Safe: 0,
          Medium: 0,
          High: 0
        };
    
        // Count by status
        for (const tunnel of tunnels) {
          if (tunnel.status === 'Safe') summary.Safe++;
          else if (tunnel.status === 'Medium') summary.Medium++;
          else if (tunnel.status === 'High') summary.High++;
        }
    
        return {
          statusCode: 200,
          body: JSON.stringify({
            summary: {
              total: summary.total,
              Safe: summary.Safe,
              Medium: summary.Medium,
              High: summary.High
            },
            tunnels: tunnels
            
          }),
          headers: {
            'Access-Control-Allow-Origin': '*', // Or 'https://yourfrontend.com'
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'POST,OPTIONS'
          },
        };
      } catch (error) {
        return {
          statusCode: 500,
          body: JSON.stringify({ error: 'Unable to retrieve tunnels', details: error.message }),
        };
      }
    };