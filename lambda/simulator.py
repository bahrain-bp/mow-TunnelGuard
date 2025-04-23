import boto3
import json
import time
import random

client = boto3.client('iot-data' , region_name = 'us-east-1')

def lambda_handler(event, context):

    print("generating payload")
    payload={
        "sensor_id": "1",
        "water_lvl": random.uniform(1.0, 120.0),
        "timestamp": int(time.time())
    }
    print("publishing to topic")

    client.publish(
        topic='sensors/flood',
        qos=0,
        payload=json.dumps(payload)
    )
    print("Done")
    return{"status":"published", "payload":payload}