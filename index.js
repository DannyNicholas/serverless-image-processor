// see: https://aws.amazon.com/blogs/networking-and-content-delivery/resizing-images-with-amazon-cloudfront-lambdaedge-aws-cdn-blog/
// see: https://sharp.pixelplumbing.com/api-resize
// see: https://github.com/sbarski/serverless-architectures-aws/blob/master/chapter-3/Listing%203.1%20-%203.4%20-%20Transcode%20Video%20Lambda/index.js
'use strict';

const AWS = require('aws-sdk');
const S3 = new AWS.S3({
    signatureVersion: 'v4',
  });
const Sharp = require('sharp');
const format = 'jpg';

const OUT_BUCKET = 'bris-aws-study-dn-processed-images';

exports.handler = async (event, context, callback) => {

    // retrieve bucket name of object key
    const inputBucket = event.Records[0].s3.bucket.name;
    const key = event.Records[0].s3.object.key;

    // replace any input file spaces with '+'
    const sourceKey = decodeURIComponent(key.replace(/\+/g, ' '));

    // remove the extension
    const outputKey = sourceKey.split('.')[0];

    try {
        console.log(`Getting image: '${key}' from bucket: '${inputBucket}'...`);
        const originalImageFile = await getImageFromBucket(inputBucket, key);
        
        console.log(`Processing image of type '${originalImageFile.ContentType}'...`);
        const processedImageBuffer = await processImage(originalImageFile.Body, format);
    
        console.log(`Writing image: '${outputKey}.${format}' to bucket: '${OUT_BUCKET}'...`);
        const result = await writeImageToBucket(OUT_BUCKET, outputKey, format, processedImageBuffer);

        console.log(`Successfully completed with tag ${result.ETag}`);
        callback(null, result);
    } catch(err) {
        console.log(`Exception while attempting to resize image file:\n${err}`);
        callback(Error(err));
    }
};

const getImageFromBucket = async (bucket, key) =>
    S3
        .getObject({
            Bucket: bucket,
            Key: key
        })
        .promise();

const processImage = async (file, format) =>
    Sharp(file)
        .resize({
            width: 100,
            height: 100,
            fit: 'fill'
        })
        .toFormat(format)
        .toBuffer();

const writeImageToBucket = async (bucket, key, format, image) =>
    S3
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
