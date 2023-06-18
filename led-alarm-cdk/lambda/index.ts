import { SNSEvent } from "aws-lambda";
import * as AWS from "aws-sdk";

const endpoint = "xxxxxxxxxxxx.iot.ap-northeast-1.amazonaws.com";
const topic = "alarm-sample/0001";
const region = "ap-northeast-1";

async function publish(state: string) {
  console.log(`publish(${state})`);
  const iotdata = new AWS.IotData({
    endpoint: endpoint,
    region: region,
  });
  const params = {
    topic: topic,
    payload: `{"state":"${state}"}`,
    qos: 0,
  };
  let result = await iotdata.publish(params).promise();
  console.log(`publish result: ${result}`);
}

export const handler = async (event: SNSEvent, _: any) => {
  for (const record of event.Records) {
    const message = JSON.parse(record.Sns.Message);
    if (message.hasOwnProperty("NewStateValue")) {
      const newStateValue = message["NewStateValue"]; // "ALARM" of "OK"
      await publish(newStateValue);
    }
  }
};
