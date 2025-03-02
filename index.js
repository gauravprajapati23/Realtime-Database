const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { MongoClient, ObjectId } = require('mongodb');
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

  app.get('/api/data', async (req, res) => {
    const data = await db.collection('testCollection').find().toArray();
    res.json(data);
  });

  app.post('/api/data', express.json(), async (req, res) => {
    const result = await db.collection('testCollection').insertOne(req.body);
    res.json(result.ops[0]);
  });

  app.delete('/api/data/:id', async (req, res) => {
    const result = await db.collection('testCollection').deleteOne({ _id: ObjectId(req.params.id) });
    res.json({ deleted: result.deletedCount });
  });

  app.put('/api/data/:id', express.json(), async (req, res) => {
    const result = await db.collection('testCollection').updateOne(
      { _id: ObjectId(req.params.id) },
      { $set: req.body }
    );
    res.json({ modified: result.modifiedCount });
  });

  server.listen(3000, () => {
    console.log('Server is running on port 3000');
  });
});

app.use(express.static('public'));
app.use('/admin', express.static('admin'));
