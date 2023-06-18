#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { LedAlarmCdkStack } from "../lib/led-alarm-cdk-stack";

const app = new cdk.App();
new LedAlarmCdkStack(app, "LedAlarmCdkStack", {});
