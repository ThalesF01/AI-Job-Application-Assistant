// src/config/awsConfig.js
const { S3Client } = require("@aws-sdk/client-s3");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const dotenv = require("dotenv");

dotenv.config();

// pega região do .env ou default
const REGION = process.env.REGION_AWS || "us-east-1";

// pega credenciais a partir das variáveis que você colocou no .env
const getCredentials = () => ({
  accessKeyId: process.env.ACCESS_AWS_KEY_ID,
  secretAccessKey: process.env.SECRET_AWS_ACCESS_KEY,
});

// clientes AWS v3 usando credenciais manuais
const s3Client = new S3Client({
  region: REGION,
  credentials: getCredentials(),
});

const dynamoClient = new DynamoDBClient({
  region: REGION,
  credentials: getCredentials(),
});

module.exports = { s3Client, dynamoClient };