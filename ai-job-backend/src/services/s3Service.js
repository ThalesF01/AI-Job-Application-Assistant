// src/services/s3Service.js
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../config/awsConfig.js";
import dotenv from "dotenv";
dotenv.config();

const BUCKET = process.env.S3_BUCKET_NAME;

if (!BUCKET) {
  throw new Error("S3_BUCKET_NAME não configurado no .env");
}

export const uploadFile = async (buffer, key, contentType) => {
  try {
    const params = {
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    };

    const command = new PutObjectCommand(params);
    const result = await s3Client.send(command);

    // Monta a URL pública (padrão). Ajuste se usar configuração diferente (site hosting / CloudFront).
    const location = `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${encodeURIComponent(key)}`;

    // log para debug
    console.log("S3 PutObject result metadata:", result.$metadata);

    return { Location: location, ETag: result.ETag };
  } catch (err) {
    console.error("Erro ao enviar arquivo para S3:", err);
    throw err;
  }
};
