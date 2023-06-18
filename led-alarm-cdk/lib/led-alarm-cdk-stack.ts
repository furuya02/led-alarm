import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  aws_cloudwatch,
  aws_cloudwatch_actions,
  aws_sns,
  aws_iam,
  aws_lambda_event_sources,
  aws_lambda_nodejs,
  aws_lambda,
} from "aws-cdk-lib";

export class LedAlarmCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const tag = "led_alarm";
    const target_functionName = "test_function";

    const topic = new aws_sns.Topic(this, `Topic`, {
      displayName: `${tag}_Topic`,
      topicName: `${tag}_Topic`,
    });

    const alarm = new aws_cloudwatch.Alarm(this, "Alarm", {
      alarmName: `${tag}_Alarm`,
      comparisonOperator:
        aws_cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      threshold: 1,
      evaluationPeriods: 1,
      datapointsToAlarm: 1,
      treatMissingData: aws_cloudwatch.TreatMissingData.NOT_BREACHING,
      metric: new aws_cloudwatch.Metric({
        namespace: "AWS/Lambda",
        metricName: "Errors",
        dimensionsMap: { FunctionName: target_functionName },
        statistic: "SUM",
        period: cdk.Duration.minutes(1),
      }),
    });
    alarm.addAlarmAction(new aws_cloudwatch_actions.SnsAction(topic));
    alarm.addOkAction(new aws_cloudwatch_actions.SnsAction(topic));

    const lambda = new aws_lambda_nodejs.NodejsFunction(this, "lambda", {
      functionName: `${tag}_function`,
      entry: "lambda/index.ts",
      handler: "handler",
      runtime: aws_lambda.Runtime.NODEJS_18_X,
      logRetention: cdk.aws_logs.RetentionDays.TWO_WEEKS,
    });
    lambda.addToRolePolicy(
      new aws_iam.PolicyStatement({
        resources: ["*"],
        actions: ["iot:Publish"],
      })
    );
    lambda.addEventSource(
      new aws_lambda_event_sources.SnsEventSource(topic, {})
    );
  }
}
