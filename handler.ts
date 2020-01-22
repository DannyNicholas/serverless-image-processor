import { Callback, Context, Handler, S3EventRecord, S3Event } from 'aws-lambda';
import { S3, AWSError } from 'aws-sdk';
import * as sharp from 'sharp';
import { PromiseResult } from 'aws-sdk/lib/request';
import { GetObjectOutput, Body, PutObjectOutput } from 'aws-sdk/clients/s3';

const s3 = new S3({
    signatureVersion: 'v4',
  });
const format = 'jpg';
const OUT_BUCKET = process.env.PROCESSED_BUCKET;


export const imageTransform: Handler = async (event: S3Event, context: Context, callback: Callback) => {
  
  // retrieve bucket details - we only expect 1 record
  const s3RecordEvent: S3EventRecord = event.Records[0];
  console.log(`Received Event:\n${JSON.stringify(s3RecordEvent, null, 2)}`);
  const inputBucket: string = s3RecordEvent.s3.bucket.name;
  const key: string = s3RecordEvent.s3.object.key;

  // replace any input file spaces with '+'
  const sourceKey: string = decodeURIComponent(key.replace(/\+/g, ' '));

  // remove the extension
  const outputKey: string = sourceKey.split('.')[0];
  
  try {
      console.log(`Getting image: '${key}' from bucket: '${inputBucket}'...`);
      const originalImageFile: PromiseResult<GetObjectOutput, AWSError> = await getImageFromBucket(inputBucket, key);
      
      console.log(`Processing image of type '${originalImageFile.ContentType}'...`);
      const objectBuffer: Buffer = originalImageFile.Body as Buffer;
      const processedImageBuffer: Buffer = await processImage(objectBuffer, format);
  
      console.log(`Writing image: '${outputKey}.${format}' to bucket: '${OUT_BUCKET}'...`);
      const result: PromiseResult<PutObjectOutput, AWSError> = await writeImageToBucket(OUT_BUCKET, outputKey, format, processedImageBuffer);

      console.log(`Successfully completed with tag ${result.ETag}`);
      callback(null, `{ message: 'SUCCESS', tag: ${result.ETag},  event }`);
  } catch(err) {
    if(typeof err === 'object' && err.hasOwnProperty('message')) {
      console.log(`Exception '${err.message}' while attempting to resize image file.`);
      callback(err);
    }
    else {
      console.log(`Exception while attempting to resize image file:\n${err}`);
      callback(Error(err));
    }
  }
}

const getImageFromBucket = async (bucket: string, key: string): Promise<PromiseResult<GetObjectOutput, AWSError>> =>
    s3
        .getObject({
            Bucket: bucket,
            Key: key
        })
        .promise();

const processImage = async (file: Buffer, format: string): Promise<Buffer> =>
  sharp(file)
        .resize({
            width: 100,
            height: 100,
            fit: 'fill'
        })
        .toFormat(format)
        .toBuffer();

const writeImageToBucket = async (bucket: string, key: string, format: string, image): Promise<PromiseResult<PutObjectOutput, AWSError>> =>
    s3
        .putObject({
            Body: image,
            Bucket: bucket,
            ContentType: `image/${format}`,
            CacheControl: 'max-age=3153600',
            Key: `${key}.${format}`,
            StorageClass: 'STANDARD',
            ACL: 'public-read'
        })
        .promise();
