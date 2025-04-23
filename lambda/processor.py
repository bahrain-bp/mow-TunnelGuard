def lambda_handler(event, context):
    print("Event from IoT Core")
    print(event)

    if event.get("water_lvl", 0) > 100:
        print("High water level detected")
    
    return {
        'statuscode' : 200,
        'body' : 'Data Processed'
    }