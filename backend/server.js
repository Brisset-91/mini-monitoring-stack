
require("dotenv").config();
const express = require("express");
const cors = require('cors');
const {DynamoDBClient} = require("@aws-sdk/client-dynamodb");
const {DynamoDBDocumentClient, PutCommand, ScanCommand, QueryCommand} = require("@aws-sdk/lib-dynamodb");
const {v4: uuidv4} = require("uuid");

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración del cliente DynamoDB para LocalStack
const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  endpoint: process.env.DYNAMODB_ENDPOINT || "http://localhost:4566", // Endpoint de LocalStack
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "test",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "test"
  }
});

const docClient = DynamoDBDocumentClient.from(dynamoClient);
const TABLE_NAME = process.env.DYNAMODB_TABLE || "ComentariosApp";

// CORS flexible para desarrollo
app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origin (como Postman) y localhost en cualquier puerto
    if (!origin || /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Middleware para parsear JSON en el body  de las solicitudes

app.use(express.json());

// GET: Obtener todos los comentarios ordenados por fecha (más recientes primero)
app.get("/comentarios", async (req, res) => {
  try {
    const command = new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: "FechaIndex", // Asegúrate de tener un índice secundario global en 'fecha'
      KeyConditionExpression: "tipo = :tipo",
      ExpressionAttributeValues: {
        ":tipo": "comentario"
      },
      ScanIndexForward: false // Orden descendente
    });

  const response = await docClient.send(command);

  // Convertir timestamp a formato Date
  const comentarios = response.Items.map(item => ({
    id: item.id,
    autor: item.autor,
    mensaje: item.mensaje,
    fecha: new Date(item.fecha)
  }));

    res.json(comentarios);
  } catch (error) {
    console.error("Error al obtener comentarios:", error);
    res.status(500).json({ error: "Error al obtener comentarios" });
  }
})

// POST: Crear un nuevo comentario
app.post("/comentarios", async (req, res) => {
  try {
    const { autor, mensaje } = req.body;
    console.log("autor:", autor, "mensaje:", mensaje);
    if (!autor || !mensaje) {
      return res.status(400).json({ error: "Faltan campos requeridos: autor y mensaje" });
    }

    const now = Date.now();
    const nuevoComentario = {
      id: uuidv4(),
      tipo: "comentario", // Atributo para la clave de partición
      autor,
      mensaje,
      fecha: now // Almacenar como timestamp (número)
    };
    console.log("nuevoComentario:", nuevoComentario);
    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: nuevoComentario
    });
    console.log("command:", command);
    await docClient.send(command);

    // Devolver con fecha en formato Date para consistencia
    res.status(201).json({
      ...nuevoComentario,
      fecha: new Date(now)
    });
  } catch (error) {
    console.error("Error al crear comentario:", error);
    res.status(500).json({ error: "Error al crear comentario" });
  }
})

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date()})  
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log(`Conectado a DynamoDB en: ${process.env.DYNAMODB_ENDPOINT || "http://localhost:4566"}`);
  });
}

module.exports = app; // <-- Exporta el app para Supertest