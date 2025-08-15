// src/services/dynamoService.js
import dotenv from "dotenv";
dotenv.config();

import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoClient } from "../config/awsConfig.js";

const TABLE = process.env.DYNAMO_TABLE_NAME;
if (!TABLE) throw new Error("DYNAMO_TABLE_NAME não configurado no .env");

const docClient = DynamoDBDocumentClient.from(dynamoClient);

export const saveApplication = async (application) => {
  try {
    const params = {
      TableName: TABLE,
      Item: application,
    };

    const result = await docClient.send(new PutCommand(params));
    console.log("DynamoDB PutItem result:", result);
    return result;
  } catch (err) {
    console.error("Erro ao salvar no DynamoDB:", err);
    throw err;
  }
};

export const getApplicationById = async (id) => {
  // opcional: implementar GetCommand se precisar buscar; deixei apenas Put por enquanto
};
