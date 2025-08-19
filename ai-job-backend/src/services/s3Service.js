// src/services/s3Service.js
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { s3Client } = require("../config/awsConfig.js");
const dotenv = require("dotenv");
dotenv.config();

const BUCKET = process.env.S3_BUCKET_NAME;

if (!BUCKET) {
  throw new Error("S3_BUCKET_NAME não configurado no .env");
}

const uploadFile = async (buffer, key, contentType) => {
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
    const location = `https://${BUCKET}.s3.${process.env.REGION_AWS}.amazonaws.com/${encodeURIComponent(key)}`;

    // log para debug
    console.log("S3 PutObject result metadata:", result.$metadata);

    return { Location: location, ETag: result.ETag };
  } catch (err) {
    console.error("Erro ao enviar arquivo para S3:", err);
    throw err;
  }
};

module.exports = uploadFile ;
