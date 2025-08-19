// src/services/dynamoService.js
const dotenv = require("dotenv");
dotenv.config();

const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { dynamoClient } = require("../config/awsConfig");

const TABLE = process.env.DYNAMO_TABLE_NAME;
if (!TABLE) throw new Error("DYNAMO_TABLE_NAME não configurado no .env");

const docClient = DynamoDBDocumentClient.from(dynamoClient);

const saveApplication = async (application) => {
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

const getApplicationById = async (id) => {
  // opcional: implementar GetCommand se precisar buscar; deixei apenas Put por enquanto
};

module.exports = { saveApplication, getApplicationById };
