import { APIGatewayEvent, Callback, Context, Handler } from 'aws-lambda';

export const hello: Handler = (event: APIGatewayEvent, context: Context, cb: Callback) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Go Serverless Webpack (Typescript) v1.0! Your function executed successfully!',
      input: event,
    }),
  };

  // cb(null, response);

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  cb(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
}
