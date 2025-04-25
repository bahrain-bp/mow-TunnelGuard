import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as cognito from "aws-cdk-lib/aws-cognito";
import { Duration } from "aws-cdk-lib";
import { RemovalPolicy } from "aws-cdk-lib";
import { APIStack } from "./api-stack";

export class DBStack extends cdk.Stack {
  public readonly casesTable: dynamodb.Table;
  public readonly usersTable: dynamodb.Table;
  public readonly tunnelsTable: dynamodb.Table;
  public readonly sensorsTable: dynamodb.Table;
  public readonly sensorReadingsTable: dynamodb.Table;
  public readonly alertsTable: dynamodb.Table;
  public readonly auditLogsTable: dynamodb.Table;
  public readonly requestsTable: dynamodb.Table;
  public readonly countersTable: dynamodb.Table;
  public readonly userPool: cognito.UserPool;


  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create DynamoDB Table for cases
    this.casesTable = new dynamodb.Table(this, "[ChallengeName]CaseHistory", {
      partitionKey: { 
        name: "caseID", 
        type: dynamodb.AttributeType.STRING 
      },
      removalPolicy: RemovalPolicy.DESTROY, // Ensure table is deleted during stack removal
    });

    //Users Table
    this.usersTable = new dynamodb.Table(this, "Users", {
      tableName: "Users",
      partitionKey: { name: "user_id", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    //Tunnels Table
    this.tunnelsTable = new dynamodb.Table(this, "Tunnels", {
      tableName: "Tunnels",
      partitionKey: { name: "tunnel_id", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    //Sensors Table
    this.sensorsTable = new dynamodb.Table(this, "Sensors", {
      tableName: "Sensors",
      partitionKey: { name: "sensor_id", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "tunnel_id", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    //SensorReadings Table
    this.sensorReadingsTable = new dynamodb.Table(this, "SensorReadings", {
      tableName: "SensorReadings",
      partitionKey: { name: "sensor_id", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "read_at", type: dynamodb.AttributeType.STRING }, // Unix timestamp
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    //Alerts Table
    this.alertsTable = new dynamodb.Table(this, "Alerts", {
      tableName: "Alerts",
      partitionKey: { name: "alert_id", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "created_at", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    //AuditLogs Table
    this.auditLogsTable = new dynamodb.Table(this, "AuditLogs", {
      tableName: "AuditLogs",
      partitionKey: { name: "log_id", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "created_at", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    //Requests Table
    this.requestsTable = new dynamodb.Table(this, "Requests", {
      tableName: "Requests",
      partitionKey: { name: "request_id", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "created_at", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    //Testing Lambdas

    
    const insertTunnels = new lambda.Function(this, 'insertTunnels', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'insertTunnel.handler',
      code: lambda.Code.fromAsset('lambda'),
      timeout: Duration.seconds(10),
    });

    const insertSensors = new lambda.Function(this, 'insertSensors', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'insertSensor.handler',
      code: lambda.Code.fromAsset('lambda'),
      timeout: Duration.seconds(10),
      
    });

    const insertSensorReadings = new lambda.Function(this, 'insertSensorReadings', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'insertSensorReading.handler',
      code: lambda.Code.fromAsset('lambda'),
      timeout: Duration.seconds(10),
    });

    this.tunnelsTable.grantReadWriteData(insertTunnels); // Grant permissions to the Lambda function
    this.sensorsTable.grantReadWriteData(insertSensors); // Grant permissions to the Lambda function
    this.sensorReadingsTable.grantReadWriteData(insertSensorReadings); // Grant permissions to the Lambda function

    
    
    // Create a Cognito User Pool lambda function to attach to the database
    const postCognito = new lambda.Function(this, 'postCognito', {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'postCognito.handler',
      environment: {
        USERS_TABLE: this.usersTable.tableName, // Pass table name as environment variable
      },
    });
    
    this.usersTable.grantWriteData(postCognito); // allow writing to DynamoDB
    
    // Create a Cognito User Pool
    const userPool = new cognito.UserPool(this, 'TunnelGuardUserPool', {
      userPoolName: 'TunnelGuardUserPool',
      selfSignUpEnabled: true,
      signInAliases: {
        email: true, // users can sign in with email
      },
      autoVerify: {
        email: true,
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: false,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,

      
      lambdaTriggers: {
        postConfirmation: postCognito, // Attach the Lambda function to the post-confirmation trigger
      }
    });

    // Optional: create a User Pool Client
    const userPoolClient = new cognito.UserPoolClient(this, 'TunnelGuardUserPoolClient', {
      userPool,
      generateSecret: false,
      userPoolClientName: 'TunnelGuardClient',
      authFlows: {
        userPassword: true,
      },
    });

    

  }
}
