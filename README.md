# serverless-image-processor
Serverless Image Processor

 serverless invoke local -f imageTransform -p tests/event.json



 {
  "name": "serverless-image-processor",
  "version": "1.0.0",
  "description": "Serverless Image Processsor using webpack and Typescript",
  "main": "handler.js",
  "scripts": {
    "start": "node --experimental-modules test.js",
    "test": "run-local-lambda --experimental-modules --file handler.ts --event tests/event.json",
    "predeploy": "zip -r image-resize.zip * -x *.zip *.json *.log",
    "deploy": "aws lambda update-function-code --function-name arn:aws:lambda:eu-west-1:423299723934:function:dn-image-resize --zip-file fileb://image-resize.zip"
  },
  "author": "Danny Nicholas",
  "license": "ISC",
  "dependencies": {
    "aws-sdk": "^2.606.0",
    "serverless-s3-remover": "^0.6.0",
    "sharp": "^0.24.0",
    "@types/sharp": "^0.24.0",
    "source-map-support": "^0.5.0"
  },
  "devDependencies": {
    "run-local-lambda": "^1.1.1",
    "@types/aws-lambda": "8.10.1",
    "@types/node": "^8.0.57",
    "serverless-webpack": "^5.1.1",
    "ts-loader": "^4.2.0",
    "typescript": "^2.8.1",
    "webpack": "^4.5.0"
  }
}

