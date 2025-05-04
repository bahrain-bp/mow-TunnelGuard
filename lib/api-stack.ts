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

    
    const insertTunnels = new lambda.Function(this, 'insertTunnels', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'insertTunnel.handler',
      code: lambda.Code.fromAsset('lambda')
    });

    const insertSensors = new lambda.Function(this, 'insertSensors', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'insertSensor.handler',
      code: lambda.Code.fromAsset('lambda'),
      
    });

    const insertSensorReadings = new lambda.Function(this, 'insertSensorReadings', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'insertSensorReading.handler',
      code: lambda.Code.fromAsset('lambda'),
    });

    dbStack.tunnelsTable.grantReadWriteData(insertTunnels); // Grant permissions to the Lambda function
    dbStack.sensorsTable.grantReadWriteData(insertSensors); // Grant permissions to the Lambda function
    dbStack.sensorReadingsTable.grantReadWriteData(insertSensorReadings); // Grant permissions to the Lambda function

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
      },
    });

    // Grant permissions for Lambda functions to interact with DynamoDB
    dbStack.tunnelsTable.grantReadData(tunnelListLambda);
    dbStack.tunnelsTable.grantReadData(tunnelDetailLambda);

    // Create the API Gateway for Tunnels
    //Tunnels List View
    const tunnels = api.root.addResource("tunnels");
    tunnels.addMethod("GET", new apigateway.LambdaIntegration(tunnelListLambda)); // GET /tunnels
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

    const alertDetail = alerts.addResource("{alertId}");
    alertDetail.addMethod("GET", new apigateway.LambdaIntegration(alertsDetailLambda)); // GET /alerts/{alertId}

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

    const requestDetail = requests.addResource("{requestId}");
    requestDetail.addMethod("GET", new apigateway.LambdaIntegration(requestsDetailLambda)); // GET /requests/{requestId}


  }
}
