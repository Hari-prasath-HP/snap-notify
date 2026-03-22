import { S3Client } from "@aws-sdk/client-s3";
const region = process.env.AWS_REGION;
const accessKey = process.env.AWS_ACCESS_KEY_ID;
const secretKey = process.env.AWS_SECRET_ACCESS_KEY;

if (!region || !accessKey || !secretKey) {
  throw new Error("Missing AWS environment variables");
}

export const s3 = new S3Client({
  region,
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretKey,
  },
});