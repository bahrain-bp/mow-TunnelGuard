import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

export class IoTSensorStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Sensor simulation Lambda
    const sensorSimulatorLambda = new lambda.Function(this, 'SensorSimulatorLambda', {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'simulator.lambda_handler',
      code: lambda.Code.fromAsset('lambda'),
      timeout: cdk.Duration.seconds(10)
    });

    sensorSimulatorLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: ['iot:Publish'],
      resources: ['*']
    }));

    // Processing Lambda
    const sensorProcessorLambda = new lambda.Function(this, 'SensorProcessorLambda', {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'processor.lambda_handler',
      code: lambda.Code.fromAsset('lambda')
    });

    // SNS Topic
    const floodAlertTopic = new sns.Topic(this, 'FloodAlertTopic', {
      displayName: 'High Flood Risk Alert Topic'
    });

    // Add subscription if needed
    // floodAlertTopic.addSubscription(new subscriptions.EmailSubscription('your-email@example.com'));

    sensorProcessorLambda.addPermission('AllowToInvoke', {
      principal: new iam.ServicePrincipal('iot.amazonaws.com'),
      action: 'lambda:InvokeFunction'
    });

    floodAlertTopic.grantPublish(sensorProcessorLambda);

    // IoT Topic Rule using L1 construct (CfnTopicRule)
    const iotSnsRole = this.createIotSnsRole(floodAlertTopic.topicArn);
    
    const sensorDataRule = new cdk.aws_iot.CfnTopicRule(this, 'SensorDataRule', {
      topicRulePayload: {
        sql: "SELECT * FROM 'sensors/flood'",
        actions: [
          {
            lambda: {
              functionArn: sensorProcessorLambda.functionArn
            }
          },
          {
            sns: {
              targetArn: floodAlertTopic.topicArn,
              roleArn: iotSnsRole.roleArn
            }
          }
        ],
        ruleDisabled: false
      }
    });
  }

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