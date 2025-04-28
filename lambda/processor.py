import json
import boto3
import os
import uuid
from datetime import datetime
from decimal import Decimal

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb')
sensor_readings_table = dynamodb.Table('SensorReadings')
tunnels_table = dynamodb.Table('Tunnels')
alerts_table = dynamodb.Table('Alerts')

def lambda_handler(event, context):
    """
    Lambda function to process IoT sensor data for water levels
    - Stores sensor readings in DynamoDB
    - Creates alerts if thresholds are exceeded
    - Updates tunnel status if needed
    
    Expected event format:
    {
        "sensor_id": "string",
        "tunnel_id": "string",
        "water_lvl": number,
        "timestamp": "string" (optional)
    }
    """
    print("Event received from IoT Core:")
    print(json.dumps(event))
    
    try:
        # Extract data from event
        sensor_id = event.get("sensor_id")
        tunnel_id = event.get("tunnel_id")
        water_level = float(event.get("water_lvl", 0))  # Ensure it's a float for comparisons
        
        # Validate required fields
        if not sensor_id:
            return error_response("Missing sensor_id in event data")
        
        if not tunnel_id:
            return error_response("Missing tunnel_id in event data")
        
        # Use provided timestamp or generate current time
        timestamp = event.get("timestamp", datetime.utcnow().isoformat())
        
        # Store the sensor reading
        store_sensor_reading(sensor_id, timestamp, water_level)
        
        # Get tunnel threshold from DynamoDB
        threshold = get_tunnel_threshold(tunnel_id)
        
        # Check thresholds and create alert if needed
        if water_level > threshold:
            print(f"High water level detected: {water_level} (threshold: {threshold})")
            create_alert(sensor_id, tunnel_id, water_level, timestamp)
            update_tunnel_status(tunnel_id, "Warning", timestamp)
        else:
            # Update tunnel status to safe if previously in warning state
            update_tunnel_status(tunnel_id, "Safe", timestamp)
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Data processed successfully',
                'sensor_id': sensor_id,
                'tunnel_id': tunnel_id,
                'water_level': water_level,
                'timestamp': timestamp
            })
        }
    
    except Exception as e:
        print(f"Error processing event: {str(e)}")
        return error_response(f"Error processing event: {str(e)}")

def store_sensor_reading(sensor_id, timestamp, sensor_reading):
    """Store sensor reading in DynamoDB"""
    try:
        sensor_readings_table.put_item(
            Item={
                'sensor_id': sensor_id,
                'read_at': timestamp,
                'sensor_reading': Decimal(str(sensor_reading))
            }
        )
        print(f"Stored sensor reading: {sensor_id}, {sensor_reading}")
        return True
    except Exception as e:
        print(f"Error storing sensor reading: {str(e)}")
        raise e

def get_tunnel_threshold(tunnel_id):
    """Get the threshold value for a tunnel"""
    try:
        response = tunnels_table.get_item(
            Key={
                'tunnel_id': tunnel_id
            }
        )
        
        if 'Item' in response:
            # Get threshold value with default of 100 if not set
            return response['Item'].get('threshhold', 100)
        else:
            print(f"Tunnel {tunnel_id} not found, using default threshold")
            return 100
    except Exception as e:
        print(f"Error retrieving tunnel threshold: {str(e)}")
        # Default threshold if error occurs
        return 100

def update_tunnel_status(tunnel_id, status, timestamp):
    """Update the status of a tunnel"""
    try:
        tunnels_table.update_item(
            Key={
                'tunnel_id': tunnel_id
            },
            UpdateExpression="set #status = :s, last_status_time = :t",
            ExpressionAttributeNames={
                '#status': 'status'  # Using expression attribute name because status might be reserved word
            },
            ExpressionAttributeValues={
                ':s': status,
                ':t': timestamp
            }
        )
        print(f"Updated tunnel {tunnel_id} status to {status}")
        return True
    except Exception as e:
        print(f"Error updating tunnel status: {str(e)}")
        raise e

def create_alert(sensor_id, tunnel_id, sensor_reading, timestamp):
    """Create an alert record in DynamoDB"""
    try:
        alert_id = str(uuid.uuid4())
        
        alerts_table.put_item(
            Item={
                'alert_id': alert_id,
                'created_at': timestamp,
                'tunnel_id': tunnel_id,
                'type': 'HIGH_WATER_LEVEL',
                'sensor_reading': Decimal(str(sensor_reading)),
                'sensor_id': sensor_id,
                'acknowledged': False,
                'acknowledged_by': None,
                'acknowledged_at': None,
                'actions': []
            }
        )
        print(f"Created alert: {alert_id} for sensor: {sensor_id}, reading: {sensor_reading}")
        return True
    except Exception as e:
        print(f"Error creating alert: {str(e)}")
        raise e

def error_response(message):
    """Return an error response"""
    return {
        'statusCode': 400,
        'body': json.dumps({'error': message})
    }