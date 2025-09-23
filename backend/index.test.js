
require("dotenv").config();
const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const app = require('./index'); // lo ajustaremos abajo

describe('GET /comentarios', () => {
  beforeAll(async () => {
    const dbUrl = process.env.MONGO_URL || "mongodb://localhost:27017/comentarios_test";
    await mongoose.connect(dbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('debería responder con código 200 y un array', async () => {
    const res = await request(app).get('/comentarios');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
