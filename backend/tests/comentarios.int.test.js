
// backend/tests/comentarios.int.test.js
const request = require("supertest");
const { DynamoDBClient, CreateTableCommand, ListTablesCommand, DescribeTableCommand, DeleteItemCommand } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand } = require("@aws-sdk/lib-dynamodb");

jest.setTimeout(30000); // aumentar timeout para waiting table / network

const DYNAMODB_ENDPOINT = process.env.DYNAMODB_ENDPOINT || "http://localhost:4566";
const REGION = process.env.AWS_REGION || "us-east-1";
const TABLE_NAME = process.env.DYNAMODB_TABLE || "comentarios";

const dynamoClient = new DynamoDBClient({
  region: REGION,
  endpoint: DYNAMODB_ENDPOINT,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "test",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "test"
  }
});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

async function ensureTableExists() {
  const list = await dynamoClient.send(new ListTablesCommand({}));
  if (!list.TableNames || !list.TableNames.includes(TABLE_NAME)) {
    const params = {
      TableName: TABLE_NAME,
      AttributeDefinitions: [
        { AttributeName: "id", AttributeType: "S" },
        { AttributeName: "tipo", AttributeType: "S" },
        { AttributeName: "fecha", AttributeType: "N" }
      ],
      KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
      BillingMode: "PAY_PER_REQUEST",
      GlobalSecondaryIndexes: [
        {
          IndexName: "FechaIndex",
          KeySchema: [
            { AttributeName: "tipo", KeyType: "HASH" },
            { AttributeName: "fecha", KeyType: "RANGE" }
          ],
          Projection: { ProjectionType: "ALL" }
        }
      ]
    };
    await dynamoClient.send(new CreateTableCommand(params));
  }

  // Esperar table ACTIVE
  const maxTries = 20;
  for (let i = 0; i < maxTries; i++) {
    const desc = await dynamoClient.send(new DescribeTableCommand({ TableName: TABLE_NAME }));
    if (desc.Table && desc.Table.TableStatus === "ACTIVE") return;
    await new Promise(r => setTimeout(r, 1000));
  }
  throw new Error("Timeout esperando que la tabla DynamoDB esté ACTIVE");
}

let app;
let serverAgent;

beforeAll(async () => {
  // Asegurar tabla exist
  await ensureTableExists();

  // Importar app (tu server.js exporta app)
  app = require("../server"); // ajustar ruta si tu server.js está en otra carpeta
  serverAgent = request(app);
});

afterAll(async () => {
  // Opcional: limpiar datos creados por el test
  // const items = await docClient.send(new ScanCommand({ TableName: TABLE_NAME }));
  // for (const it of items.Items || []) {
  //   await dynamoClient.send(new DeleteItemCommand({ TableName: TABLE_NAME, Key: { id: { S: it.id } } }));
  // }
});

test("POST /comentarios -> 201 y GET /comentarios devuelve al menos 1 item", async () => {
  const nuevo = { autor: "test-integration", mensaje: "Hola desde test" };

  const postRes = await serverAgent
    .post("/comentarios")
    .send(nuevo)
    .set("Accept", "application/json");

  expect(postRes.status).toBe(201);
  expect(postRes.body).toHaveProperty("id");
  expect(postRes.body.autor).toBe(nuevo.autor);
  expect(postRes.body.mensaje).toBe(nuevo.mensaje);
  expect(postRes.body).toHaveProperty("fecha");

  const getRes = await serverAgent
    .get("/comentarios")
    .set("Accept", "application/json");

  expect(getRes.status).toBe(200);
  expect(Array.isArray(getRes.body)).toBe(true);
  // debe haber al menos 1 comentario (el que acabamos de crear)
  const found = getRes.body.find(c => c.autor === nuevo.autor && c.mensaje === nuevo.mensaje);
  expect(found).toBeDefined();
});
