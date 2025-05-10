import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { DBStack } from "./DBstack"; // Import DBStack
import * as iam from 'aws-cdk-lib/aws-iam';
import { MyCdkStack } from "./my-cdk-app-stack";
import * as cognito from "aws-cdk-lib/aws-cognito";

export class APIStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, dbStack: DBStack, props?: cdk.StackProps) {
    super(scope, id, props);

    // Lambda function to insert sample cases into DynamoDB
    const insertSampleCaseLambda = new lambda.Function(this, "InsertSampleCaseLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "insertSampleCase.handler",  // Ensure this points to the correct handler
      code: lambda.Code.fromAsset("lambda"),
      environment: {
        CASES_TABLE_NAME: dbStack.casesTable.tableName, // Pass table name as environment variable
      },
    });

    // Lambda function to insert new case into DynamoDB
    const insertCaseLambda = new lambda.Function(this, "InsertCaseLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "insertCase.handler",
      code: lambda.Code.fromAsset("lambda"),
      environment: {
        CASES_TABLE_NAME: dbStack.casesTable.tableName,
      },
    });

    // Lambda function to get all cases from DynamoDB
    const getCasesLambda = new lambda.Function(this, "GetCasesLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "getCases.handler",
      code: lambda.Code.fromAsset("lambda"),
      environment: {
        CASES_TABLE_NAME: dbStack.casesTable.tableName,
      },
    });

    // Lambda function for Hello World
    const helloLambda = new lambda.Function(this, "HelloLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset("lambda"),
    });

    // Grant permissions for Lambda functions to interact with DynamoDB
    dbStack.casesTable.grantReadWriteData(insertCaseLambda);
    dbStack.casesTable.grantReadData(getCasesLambda);
    dbStack.casesTable.grantReadWriteData(insertSampleCaseLambda);

    // Create the API Gateway
    const api = new apigateway.RestApi(this, "[ChallengeName]Api", {
      restApiName: "[ChallengeName] Service",
    });

    // Resource for '/cases' to insert new case
    const cases = api.root.addResource("cases");
    cases.addMethod("POST", new apigateway.LambdaIntegration(insertCaseLambda)); // POST /cases
    cases.addMethod("GET", new apigateway.LambdaIntegration(getCasesLambda));   // GET /cases

    // Resource for '/cases/sample' to insert sample cases
    const sampleCases = cases.addResource("sample");
    sampleCases.addMethod("POST", new apigateway.LambdaIntegration(insertSampleCaseLambda));  // POST /cases/sample

    // Resource for '/hello'
    const hello = api.root.addResource("hello");
    hello.addMethod("GET", new apigateway.LambdaIntegration(helloLambda));  // GET /hello

    // Outputs for both APIs
    new cdk.CfnOutput(this, "ApiEndpoint", {
      value: api.url,  // Combined API URL
    });

    //Testing Lambdas

    //Insert Tunnel Lambda function to insert new tunnel into DynamoDB
    const insertTunnels = new lambda.Function(this, 'insertTunnels', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'insertTunnel.handler',
      code: lambda.Code.fromAsset('lambda')
    });


    //Insert Sensor Lambda function to insert new sensor into DynamoDB
    const insertSensors = new lambda.Function(this, 'insertSensors', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'insertSensor.handler',
      code: lambda.Code.fromAsset('lambda'),
      
    });

    //Insert Sensor Reading Lambda function to insert new sensor reading into DynamoDB
    const insertSensorReadings = new lambda.Function(this, 'insertSensorReadings', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'insertSensorReading.handler',
      code: lambda.Code.fromAsset('lambda'),
    });

    dbStack.tunnelsTable.grantReadWriteData(insertTunnels); // Grant permissions to the Lambda function
    dbStack.sensorsTable.grantReadWriteData(insertSensors); // Grant permissions to the Lambda function
    dbStack.sensorReadingsTable.grantReadWriteData(insertSensorReadings); // Grant permissions to the Lambda function

    // Grant permissions for Lambda function to interact with DynamoDB
    insertSensorReadings.addPermission('IoTInvokePermission', {
      principal: new iam.ServicePrincipal('iot.amazonaws.com'),
      sourceArn: `arn:aws:iot:${this.region}:${this.account}:rule/apirule`
    });

    //

    //Lambda Function to Get Detail and List View of Tunnels Table
    //List View Lambda for tunnels
    const tunnelListLambda = new lambda.Function(this, "TunnelListLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "tunnelList.handler",
      code: lambda.Code.fromAsset("lambda"),
      environment: {
        TUNNELS_TABLE: dbStack.tunnelsTable.tableName,
      },
    });
    //Detail View Lambda for tunnels
    const tunnelDetailLambda = new lambda.Function(this, "TunnelDetailLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "tunnelDetail.handler",
      code: lambda.Code.fromAsset("lambda"),
      environment: {
        TUNNELS_TABLE: dbStack.tunnelsTable.tableName,
        SENSORS_TABLE: dbStack.sensorsTable.tableName,
        SENSOR_READINGS_TABLE: dbStack.sensorReadingsTable.tableName,
      },
    });

    // Grant permissions for Lambda functions to interact with DynamoDB
    dbStack.tunnelsTable.grantReadData(tunnelListLambda);
    dbStack.tunnelsTable.grantReadData(tunnelDetailLambda);
    dbStack.sensorsTable.grantReadData(tunnelDetailLambda);
    dbStack.sensorReadingsTable.grantReadData(tunnelDetailLambda);

    // Create the API Gateway for Tunnels
    //Tunnels List View
    const tunnels = api.root.addResource("tunnels");
    tunnels.addMethod("GET", new apigateway.LambdaIntegration(tunnelListLambda)); // GET /tunnels
    //Insert Tunnel Api Gateway
    tunnels.addMethod("POST", new apigateway.LambdaIntegration(insertTunnels)); // POST /tunnels
    //Tunnels Detail View
    const tunnelId = tunnels.addResource("{tunnelId}");
    tunnelId.addMethod("GET", new apigateway.LambdaIntegration(tunnelDetailLambda)); // GET /tunnels/{tunnelId}

    //Lambda Function to Get Detail and List View of Sensors Table
    //List View Lambda for sensors
    const sensorListLambda = new lambda.Function(this, "SensorListLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "sensorList.handler",
      code: lambda.Code.fromAsset("lambda"),
      environment: {
        SENSORS_TABLE: dbStack.sensorsTable.tableName,
      },
    });
    //Detail View Lambda for sensors
    const sensorDetailLambda = new lambda.Function(this, "SensorDetailLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "sensorDetail.handler",
      code: lambda.Code.fromAsset("lambda"),
      environment: {
        SENSORS_TABLE: dbStack.sensorsTable.tableName,
      },
    });

    // Grant permissions for Lambda functions to interact with DynamoDB
    dbStack.sensorsTable.grantReadData(sensorListLambda);
    dbStack.sensorsTable.grantReadData(sensorDetailLambda);

    // Create the API Gateway for Sensors
    //Sensors List View
    const sensors = tunnelId.addResource('sensors');
    sensors.addMethod('GET', new apigateway.LambdaIntegration(sensorListLambda)); // GET /tunnels/{tunnel_id}/sensors
    //Insert Sensor Api Gateway
    sensors.addMethod("POST", new apigateway.LambdaIntegration(insertSensors)); // POST /tunnels/{tunnel_id}/sensors
    //Sensors Detail View
    const sensorRoot = api.root.addResource('sensors');
    const sensorId = sensorRoot.addResource("{sensorId}");
    sensorId.addMethod("GET", new apigateway.LambdaIntegration(sensorDetailLambda)); // GET /sensors/{sensorId}

    //sensorReadings List View
    const sensorReadingsListLambda = new lambda.Function(this, "SensorReadingsListLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "sensorReadingList.handler",
      code: lambda.Code.fromAsset("lambda"),
      environment: {
        READINGS_TABLE: dbStack.sensorReadingsTable.tableName,
      },
    });
    //sensorReadings Detail View
    const sensorReadingsDetailLambda = new lambda.Function(this, "SensorReadingsDetailLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "sensorReadingDetail.handler",
      code: lambda.Code.fromAsset("lambda"),
      environment: {
        READINGS_TABLE: dbStack.sensorReadingsTable.tableName,
      },
    });

    //grant permissions for Lambda functions to interact with DynamoDB
    dbStack.sensorReadingsTable.grantReadData(sensorReadingsListLambda);
    dbStack.sensorReadingsTable.grantReadData(sensorReadingsDetailLambda);

    // Create the API Gateway for Sensor Readings
    const readings = sensorId.addResource("readings");
    readings.addMethod("GET", new apigateway.LambdaIntegration(sensorReadingsListLambda)); // GET /sensors/{sensorId}/readings

    //Insert Sensor Reading Api Gateway
    readings.addMethod("POST", new apigateway.LambdaIntegration(insertSensorReadings)); // POST /sensors/{sensorId}/readings

    const readingDetail = readings.addResource("{read_at}");
    readingDetail.addMethod("GET", new apigateway.LambdaIntegration(sensorReadingsDetailLambda)) // GET /sensors/{sensorId}/readings/{read_at}

    //AuditLogs List View
    const auditLogsListLambda = new lambda.Function(this, "AuditLogsListLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "auditLogsList.handler",
      code: lambda.Code.fromAsset("lambda"),
      environment: {
        AUDIT_LOGS_TABLE: dbStack.auditLogsTable.tableName,
      },
    });
    //AuditLogs Detail View
    const auditLogsDetailLambda = new lambda.Function(this, "AuditLogsDetailLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "auditLogsDetail.handler",
      code: lambda.Code.fromAsset("lambda"),
      environment: {
        AUDIT_LOGS_TABLE: dbStack.auditLogsTable.tableName,
      },
    });
    //grant permissions for Lambda functions to interact with DynamoDB
    dbStack.auditLogsTable.grantReadData(auditLogsListLambda);
    dbStack.auditLogsTable.grantReadData(auditLogsDetailLambda);

    // Create the API Gateway for Audit Logs
    const auditLogs = api.root.addResource("auditlogs");

    auditLogs.addMethod("GET", new apigateway.LambdaIntegration(auditLogsListLambda)); // GET /auditlogs

    const auditLogDetail = auditLogs.addResource("{logId}");
    auditLogDetail.addMethod("GET", new apigateway.LambdaIntegration(auditLogsDetailLambda)); // GET /auditlogs/{logId}

    //Alerts List View
    const alertsListLambda = new lambda.Function(this, "AlertsListLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "alertsList.handler",
      code: lambda.Code.fromAsset("lambda"),
      environment: {
        ALERTS_TABLE: dbStack.alertsTable.tableName,
      },
    });
    //Alerts Detail View
    const alertsDetailLambda = new lambda.Function(this, "AlertsDetailLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "alertsDetail.handler",
      code: lambda.Code.fromAsset("lambda"),
      environment: {
        ALERTS_TABLE: dbStack.alertsTable.tableName,
      },
    });
    //grant permissions for Lambda functions to interact with DynamoDB
    dbStack.alertsTable.grantReadData(alertsListLambda);
    dbStack.alertsTable.grantReadData(alertsDetailLambda);

    // Create the API Gateway for Alerts
    const alerts = api.root.addResource("alerts");
    alerts.addMethod("GET", new apigateway.LambdaIntegration(alertsListLambda)); // GET /alerts

    const alertDetail = alerts.addResource("{alertId}").addResource("{created_at}");
    alertDetail.addMethod("GET", new apigateway.LambdaIntegration(alertsDetailLambda)); // GET /alerts/{alertId}/{created_at}

    //Requests List View
    const requestsListLambda = new lambda.Function(this, "RequestsListLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "requestsList.handler",
      code: lambda.Code.fromAsset("lambda"),
      environment: {
        REQUESTS_TABLE: dbStack.requestsTable.tableName,
      },
    });
    //Requests Detail View
    const requestsDetailLambda = new lambda.Function(this, "RequestsDetailLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "requestsDetail.handler",
      code: lambda.Code.fromAsset("lambda"),
      environment: {
        REQUESTS_TABLE: dbStack.requestsTable.tableName,
      },
    });
    //grant permissions for Lambda functions to interact with DynamoDB
    dbStack.requestsTable.grantReadData(requestsListLambda);
    dbStack.requestsTable.grantReadData(requestsDetailLambda);

    // Create the API Gateway for Requests
    const requests = api.root.addResource("requests");

    requests.addMethod("GET", new apigateway.LambdaIntegration(requestsListLambda)); // GET /requests

    const requestDetail = requests.addResource("{requestId}").addResource("{created_at}");
    requestDetail.addMethod("GET", new apigateway.LambdaIntegration(requestsDetailLambda)); // GET /requests/{requestId}/{created_at}

    // Update Data Lambda function to update data in DynamoDB
    const updateTunnelLambda = new lambda.Function(this, "UpdateTunnelLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "updateTunnel.handler",
      code: lambda.Code.fromAsset("lambda"),
      environment: {
        TUNNELS_TABLE: dbStack.tunnelsTable.tableName,
      },
    });

    // Grant permissions for Lambda function to update data in DynamoDB
    dbStack.tunnelsTable.grantReadWriteData(updateTunnelLambda);

    // Create the API Gateway for updating data
    tunnelId.addMethod("PUT", new apigateway.LambdaIntegration(updateTunnelLambda)); // PUT /tunnels/{tunnelId}

    // Update Sensor Lambda function to update data in DynamoDB
    const updateSensorLambda = new lambda.Function(this, "UpdateSensorLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "updateSensor.handler",
      code: lambda.Code.fromAsset("lambda"),
      environment: {
        SENSORS_TABLE: dbStack.sensorsTable.tableName,
      },
    });
    // Grant permissions for Lambda function to update data in DynamoDB
    dbStack.sensorsTable.grantReadWriteData(updateSensorLambda);
    // Create the API Gateway for updating data
    sensorId.addMethod("PUT", new apigateway.LambdaIntegration(updateSensorLambda)); // PUT /sensors/{sensorId}

    // Update Alert Lambda function to update data in DynamoDB
    const updateAlertLambda = new lambda.Function(this, "UpdateAlertLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "updateAlert.handler",
      code: lambda.Code.fromAsset("lambda"),
      environment: {
        ALERTS_TABLE: dbStack.alertsTable.tableName,
      },
    });
    // Grant permissions for Lambda function to update data in DynamoDB
    dbStack.alertsTable.grantReadWriteData(updateAlertLambda);
    // Create the API Gateway for updating data
    alertDetail.addMethod("PUT", new apigateway.LambdaIntegration(updateAlertLambda)); // PUT /alerts/{alertId}/{created_at}

    // Insert Alert Lambda function to insert new alert into DynamoDB
    const insertAlertLambda = new lambda.Function(this, "InsertAlertLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "insertAlert.handler",
      code: lambda.Code.fromAsset("lambda"),
      environment: {
        ALERTS_TABLE: dbStack.alertsTable.tableName,
      },
    });
    // Grant permissions for Lambda function to insert new alert into DynamoDB
    dbStack.alertsTable.grantReadWriteData(insertAlertLambda);

    insertAlertLambda.grantInvoke(new iam.ServicePrincipal("lambda.amazonaws.com")); // Grant invoke permissions to the Lambda function

    // Update Request Lambda function to update data in DynamoDB
    const updateRequestLambda = new lambda.Function(this, "UpdateRequestLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "updateRequest.handler",
      code: lambda.Code.fromAsset("lambda"),
      environment: {
        REQUESTS_TABLE: dbStack.requestsTable.tableName,
      },
    });
    // Grant permissions for Lambda function to update data in DynamoDB
    dbStack.requestsTable.grantReadWriteData(updateRequestLambda);
    // Create the API Gateway for updating data
    requestDetail.addMethod("PUT", new apigateway.LambdaIntegration(updateRequestLambda)); // PUT /requests/{requestId}/{created_at}

    // Insert Request Lambda function to insert new request into DynamoDB
    const insertRequestLambda = new lambda.Function(this, "InsertRequestLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "insertRequest.handler",
      code: lambda.Code.fromAsset("lambda"),
      environment: {
        REQUESTS_TABLE: dbStack.requestsTable.tableName,
      },
    });
    // Grant permissions for Lambda function to insert new request into DynamoDB
    dbStack.requestsTable.grantReadWriteData(insertRequestLambda);
    insertRequestLambda.grantInvoke(new iam.ServicePrincipal("lambda.amazonaws.com")); // Grant invoke permissions to the Lambda function

    // Create the API Gateway for inserting new request
    requests.addMethod("POST", new apigateway.LambdaIntegration(insertRequestLambda)); // POST /requests


    //Delete Tunnel Cascade Senor Lambda function to delete tunnel and its sensors from DynamoDB
    const deleteTunnelCascadeSensorsLambda = new lambda.Function(this, 'DeleteTunnelCascadeSensorsLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'deleteTunnelCascadeSensors.handler',
      code: lambda.Code.fromAsset('lambda'),
      environment: {
        TUNNELS_TABLE: dbStack.tunnelsTable.tableName,
        SENSORS_TABLE: dbStack.sensorsTable.tableName,
      },
    });

    // Grant permissions for Lambda function to delete tunnel and its sensors from DynamoDB
    dbStack.tunnelsTable.grantReadWriteData(deleteTunnelCascadeSensorsLambda);
    dbStack.sensorsTable.grantReadWriteData(deleteTunnelCascadeSensorsLambda);
    // Create the API Gateway for deleting tunnel and its sensors
    tunnelId.addMethod("DELETE", new apigateway.LambdaIntegration(deleteTunnelCascadeSensorsLambda)); // DELETE /tunnels/{tunnelId}

    //Delete Sensor Lambda function to delete sensor from DynamoDB
    const deleteSensorLambda = new lambda.Function(this, 'DeleteSensorLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'deleteSensor.handler',
      code: lambda.Code.fromAsset('lambda'),
      environment: {
        SENSORS_TABLE: dbStack.sensorsTable.tableName,
      },
    });
    // Grant permissions for Lambda function to delete sensor from DynamoDB
    dbStack.sensorsTable.grantReadWriteData(deleteSensorLambda);
    // Create the API Gateway for deleting sensor
    sensorId.addMethod("DELETE", new apigateway.LambdaIntegration(deleteSensorLambda)); // DELETE /sensors/{sensorId}

  }
}
