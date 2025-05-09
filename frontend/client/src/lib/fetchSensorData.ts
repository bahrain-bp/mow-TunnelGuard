import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

console.log("📦 fetchSensorData module loaded (with hardcoded IAM credentials)");

const client = new DynamoDBClient({
  region: "us-east-1", // ✅ Update if your table is in a different region
  credentials: {
    accessKeyId: "AKIAS6LOH5LOWYN63QMH",
    secretAccessKey: "nBGg2pQ+C1BgChDyV4PY6UhgC8WpCcBdXa7zze7w"
  }
});

const docClient = DynamoDBDocumentClient.from(client);

export async function fetchSensorData(tunnelId: string) {
  console.log("📞 fetchSensorData CALLED with:", tunnelId);

  const command = new GetCommand({
    TableName: "Tunnels",
    Key: { tunnel_id: tunnelId }
  });

  try {
    const response = await docClient.send(command);
    console.log("✅ DynamoDB response received:", response);

    if (!response.Item) {
      throw new Error("Item not found for tunnel_id: " + tunnelId);
    }

    if (!response.Item.sensors) {
      throw new Error("Item found but missing 'sensors' field");
    }

    return response.Item.sensors;
  } catch (error) {
    console.error("❌ fetchSensorData ERROR:", error);
    throw error;
  }
}
