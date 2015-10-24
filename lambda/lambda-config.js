module.exports = {
  region: 'ap-northeast-1',
  handler: 'index.handler',
  role: 'arn:aws:iam::598419427635:role/lambda_basic_execution',
  functionName: 'seimei-shindan',
  timeout: 10
  // eventSource: {
  //  EventSourceArn: <event source such as kinesis ARN>,
  //  BatchSize: 200,
  //  StartingPosition: "TRIM_HORIZON"
  //}
}