const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

let db;

client.connect(err => {
  if (err) {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  }
  db = client.db('test');
  console.log('Connected to MongoDB');

  io.on('connection', (socket) => {
    console.log('New client connected');
    
    socket.on('insert', async (data) => {
      const result = await db.collection('testCollection').insertOne(data);
      io.emit('insert', result.ops[0]);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  server.listen(3000, () => {
    console.log('Server is running on port 3000');
  });
});

app.use(express.static('public'));
app.use('/admin', express.static('admin'));