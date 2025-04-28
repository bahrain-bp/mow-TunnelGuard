import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

// Interface for stack props to accept table ARNs from DBStack
interface IoTSensorStackProps extends cdk.StackProps {
  tunnelsTableArn: string;
  sensorReadingsTableArn: string;
  alertsTableArn: string;
}

export class IoTSensorStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: IoTSensorStackProps) {
    super(scope, id, props);

    // Sensor simulation Lambda
    const sensorSimulatorLambda = new lambda.Function(this, 'SensorSimulatorLambda', {
      runtime: lambda.Runtime.PYTHON_3_9,  // Match runtime with DBStack
      handler: 'simulator.lambda_handler',
      code: lambda.Code.fromAsset('lambda'),
      timeout: cdk.Duration.seconds(10),
      environment: {
        // Add any environment variables your simulator might need
        TOPIC_PREFIX: 'tunnels'
      }
    });

    // Grant IoT publish permissions to simulator
    sensorSimulatorLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: ['iot:Publish'],
      resources: ['*']
    }));

    // Processing Lambda - Use the processor we created
    const sensorProcessorLambda = new lambda.Function(this, 'SensorProcessorLambda', {
      runtime: lambda.Runtime.PYTHON_3_9, // Match the runtime in DBStack
      handler: 'processor.lambda_handler',
      code: lambda.Code.fromAsset('lambda'),
      timeout: cdk.Duration.seconds(30) // Match the timeout in DBStack
    });

    // Grant DynamoDB permissions to processor Lambda
    sensorProcessorLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: [
        'dynamodb:PutItem',
        'dynamodb:GetItem',
        'dynamodb:UpdateItem',
        'dynamodb:Query'
      ],
      resources: [
        props.tunnelsTableArn,
        props.sensorReadingsTableArn,
        props.alertsTableArn
      ]
    }));

    // SNS Topic for High Water Level Alerts
    const waterLevelAlertTopic = new sns.Topic(this, 'WaterLevelAlertTopic', {
      displayName: 'Tunnel Water Level Alert Topic'
    });

    // Add subscription if needed - uncomment and modify as needed
    // waterLevelAlertTopic.addSubscription(new subscriptions.EmailSubscription('your-email@example.com'));

    // Grant processor Lambda permission to publish to SNS
    waterLevelAlertTopic.grantPublish(sensorProcessorLambda);

    // Allow IoT service to invoke the processor Lambda
    sensorProcessorLambda.addPermission('AllowIoTInvoke', {
      principal: new iam.ServicePrincipal('iot.amazonaws.com'),
      action: 'lambda:InvokeFunction'
    });

    // Create IAM role for IoT to publish to SNS
    const iotSnsRole = this.createIotSnsRole(waterLevelAlertTopic.topicArn);
    
    // IoT Rule for water level readings
    const waterLevelRule = new cdk.aws_iot.CfnTopicRule(this, 'WaterLevelRule', {
      topicRulePayload: {
        // SQL statement that matches the expected format with tunnel_id and sensor_id
        sql: "SELECT *, topic(3) as tunnel_id, topic(5) as sensor_id FROM 'tunnels/+/sensors/+/readings'",
        actions: [
          {
            lambda: {
              functionArn: sensorProcessorLambda.functionArn
            }
          },
          {
            sns: {
              targetArn: waterLevelAlertTopic.topicArn,
              roleArn: iotSnsRole.roleArn,
              messageFormat: 'JSON'
            }
          }
        ],
        ruleDisabled: false,
        // Optional: Add error action if needed
        errorAction: {
          sns: {
            targetArn: waterLevelAlertTopic.topicArn,
            roleArn: iotSnsRole.roleArn,
            messageFormat: 'JSON'
          }
        }
      }
    });

    // // Create CloudWatch Log group for IoT rule
    // const logGroup = new logs.LogGroup(this, 'WaterLevelRuleLogGroup', {
    //   logGroupName: `/aws/iot/${waterLevelRule.topicRuleName}`,
    //   retention: logs.RetentionDays.ONE_WEEK,
    //   removalPolicy: cdk.RemovalPolicy.DESTROY
    // });
  

    // Outputs
    new cdk.CfnOutput(this, 'WaterLevelTopicPattern', {
      value: 'tunnels/{tunnel_id}/sensors/{sensor_id}/readings',
      description: 'Topic pattern for publishing water level readings'
    });
    
    new cdk.CfnOutput(this, 'WaterLevelAlertTopicArn', {
      value: waterLevelAlertTopic.topicArn,
      description: 'ARN of the SNS topic for water level alerts'
    });
    
    new cdk.CfnOutput(this, 'SensorSimulatorLambdaName', {
      value: sensorSimulatorLambda.functionName,
      description: 'Name of the sensor simulator Lambda function'
    });
  }

  // Helper method to create IAM role for IoT to publish to SNS
  private createIotSnsRole(topicArn: string): iam.Role {
    const iotSnsRole = new iam.Role(this, 'IoTToSnsRole', {
      assumedBy: new iam.ServicePrincipal('iot.amazonaws.com')
    });

    iotSnsRole.addToPolicy(new iam.PolicyStatement({
      actions: ['sns:Publish'],
      resources: [topicArn]
    }));

    return iotSnsRole;
  }
}