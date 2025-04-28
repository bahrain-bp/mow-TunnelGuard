import json
import boto3
import random
import os
from datetime import datetime

# Initialize IoT client
iot_client = boto3.client('iot-data')

def lambda_handler(event, context):
    """
    Simulates water level sensor readings and publishes them to IoT Core
    
    Expected event structure (optional):
    {
        "tunnel_id": "string",     # Optional, default is "tunnel-001"
        "sensor_id": "string",     # Optional, default is "sensor-001"
        "min_water_level": number, # Optional, default is 0
        "max_water_level": number, # Optional, default is 150
        "simulate_high_water": bool # Optional, default is False
    }
    """
    # Get parameters from event or use defaults
    tunnel_id = event.get("tunnel_id", "tunnel-001")
    sensor_id = event.get("sensor_id", "sensor-001")
    min_water_level = event.get("min_water_level", 0)
    max_water_level = event.get("max_water_level", 150)
    simulate_high_water = event.get("simulate_high_water", False)
    
    # Get the topic prefix from environment variable or use default
    topic_prefix = os.environ.get("TOPIC_PREFIX", "tunnels")
    
    # Generate a random water level
    if simulate_high_water:
        # Simulate high water level (above typical threshold)
        water_level = random.uniform(100, max_water_level)
    else:
        # Normal range
        water_level = random.uniform(min_water_level, 90)
    
    # Create the message payload
    timestamp = datetime.utcnow().isoformat()
    payload = {
        "tunnel_id": tunnel_id,
        "sensor_id": sensor_id,
        "water_lvl": round(water_level, 2),
        "timestamp": timestamp
    }
    
    # Create the topic
    topic = f"{topic_prefix}/{tunnel_id}/sensors/{sensor_id}/readings"
    
    # Publish to IoT Core
    try:
        response = iot_client.publish(
            topic=topic,
            qos=1,
            payload=json.dumps(payload)
        )
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': f'Successfully published to {topic}',
                'data': payload,
                'response': response
            })
        }
    except Exception as e:
        print(f"Error publishing to IoT Core: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': f'Failed to publish message: {str(e)}',
                'topic': topic
            })
        }