// src/config/awsConfig.js
import { S3Client } from "@aws-sdk/client-s3";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import dotenv from "dotenv";

dotenv.config();

// pega região do .env ou default
const REGION = process.env.REGION_AWS || "us-east-1";

// pega credenciais a partir das variáveis que você colocou no .env
const getCredentials = () => ({
  accessKeyId: process.env.ACCESS_AWS_KEY_ID,
  secretAccessKey: process.env.SECRET_AWS_ACCESS_KEY,
});

// clientes AWS v3 usando credenciais manuais
export const s3Client = new S3Client({
  region: REGION,
  credentials: getCredentials(),
});

export const dynamoClient = new DynamoDBClient({
  region: REGION,
  credentials: getCredentials(),
});
