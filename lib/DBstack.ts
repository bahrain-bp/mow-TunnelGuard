import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { RemovalPolicy } from "aws-cdk-lib";

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
    this.usersTable = new dynamodb.Table(this, "UsersTable", {
      tableName: "Users",
      partitionKey: { name: "user_id", type: dynamodb.AttributeType.NUMBER },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    //Tunnels Table
    this.tunnelsTable = new dynamodb.Table(this, "TunnelsTable", {
      tableName: "Tunnels",
      partitionKey: { name: "tunnel_id", type: dynamodb.AttributeType.NUMBER },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    //Sensors Table
    this.sensorsTable = new dynamodb.Table(this, "SensorsTable", {
      tableName: "Sensors",
      partitionKey: { name: "sensor_id", type: dynamodb.AttributeType.NUMBER },
      sortKey: { name: "tunnel_id", type: dynamodb.AttributeType.NUMBER },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    //SensorReadings Table
    this.sensorReadingsTable = new dynamodb.Table(this, "SensorReadingsTable", {
      tableName: "SensorReadings",
      partitionKey: { name: "sensor_id", type: dynamodb.AttributeType.NUMBER },
      sortKey: { name: "read_at", type: dynamodb.AttributeType.NUMBER }, // Unix timestamp
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    //Alerts Table
    this.alertsTable = new dynamodb.Table(this, "AlertsTable", {
      tableName: "Alerts",
      partitionKey: { name: "alert_id", type: dynamodb.AttributeType.NUMBER },
      sortKey: { name: "created_at", type: dynamodb.AttributeType.NUMBER },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    //AuditLogs Table
    this.auditLogsTable = new dynamodb.Table(this, "AuditLogsTable", {
      tableName: "AuditLogs",
      partitionKey: { name: "log_id", type: dynamodb.AttributeType.NUMBER },
      sortKey: { name: "created_at", type: dynamodb.AttributeType.NUMBER },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    //Requests Table
    this.requestsTable = new dynamodb.Table(this, "RequestsTable", {
      tableName: "Requests",
      partitionKey: { name: "request_id", type: dynamodb.AttributeType.NUMBER },
      sortKey: { name: "created_at", type: dynamodb.AttributeType.NUMBER },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    //Counters Table (for auto-incrementing IDs)
    this.countersTable = new dynamodb.Table(this, "CountersTable", {
      tableName: "Counters",
      partitionKey: { name: "counter_id", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    });
  }
}
