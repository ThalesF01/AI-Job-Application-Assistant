// src/config/awsConfig.js
import dotenv from "dotenv";
import { fromEnv } from "@aws-sdk/credential-providers";
import { S3Client } from "@aws-sdk/client-s3";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

dotenv.config();

// pega região e nomes do .env
const REGION = process.env.AWS_REGION || "us-east-1";

const getCredentials = () => {
  // Prioriza variáveis de ambiente (AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY)
  return fromEnv(); // provider que lê das env vars
};

// clientes AWS v3
export const s3Client = new S3Client({
  region: REGION,
  credentials: getCredentials(),
});

export const dynamoClient = new DynamoDBClient({
  region: REGION,
  credentials: getCredentials(),
});
