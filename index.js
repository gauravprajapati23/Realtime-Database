const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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

  app.use(express.json());

  app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await db.collection('users').findOne({ username });
    if (user && bcrypt.compareSync(password, user.password)) {
      const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ token });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  });

  app.post('/api/register', async (req, res) => {
    const { username, password, role } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 8);
    const result = await db.collection('users').insertOne({ username, password: hashedPassword, role });
    res.json(result.ops[0]);
  });

  app.get('/api/data', verifyToken, async (req, res) => {
    const data = await db.collection('testCollection').find().toArray();
    res.json(data);
  });

  app.post('/api/data', verifyToken, async (req, res) => {
    const result = await db.collection('testCollection').insertOne(req.body);
    res.json(result.ops[0]);
  });

  app.put('/api/data/:id', verifyToken, async (req, res) => {
    const result = await db.collection('testCollection').updateOne(
      { _id: ObjectId(req.params.id) },
      { $set: req.body }
    );
    res.json({ modified: result.modifiedCount });
  });

  app.delete('/api/data/:id', verifyToken, async (req, res) => {
    const result = await db.collection('testCollection').deleteOne({ _id: ObjectId(req.params.id) });
    res.json({ deleted: result.deletedCount });
  });

  function verifyToken(req, res, next) {
    const token = req.headers['x-access-token'];
    if (!token) {
      return res.status(403).send({ message: 'No token provided.' });
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(500).send({ message: 'Failed to authenticate token.' });
      }
      req.userId = decoded.id;
      req.userRole = decoded.role;
      next();
    });
  }

  server.listen(3000, () => {
    console.log('Server is running on port 3000');
  });
});

app.use(express.static('public'));
app.use('/admin', express.static('admin'));
