import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { Task } from './task.model.js';

const app = express();
const PORT = 3000;

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: 'http://localhost:4200', methods: ['GET', 'POST', 'PATCH'] }
});

app.use(cors({ origin: 'http://localhost:4200' }));
app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/realtime_board')
  .then(() => console.log('🍃 MongoDB Connected'))
  .catch(err => console.error(err));

app.get('/api/tasks', async (req, res) => {
  const tasks = await Task.find();
  res.json(tasks);
});

app.post('/api/tasks', async (req, res) => {
  const newTask = new Task(req.body);
  await newTask.save();
  
  io.emit('taskCreated', newTask);
  res.status(201).json(newTask);
});

app.patch('/api/tasks/:id', async (req, res) => {
  const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
  
  io.emit('taskUpdated', updatedTask);
  res.json(updatedTask);
});

app.get('/api/analytics/stats', async (req, res) => {
  try {
    const stats = await Task.aggregate([
      {
        $group: {
          _id: '$status',
          totalTasks: { $sum: 1 },
          totalPoints: { $sum: '$points' }
        }
      }
    ]);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

if (process.env.NODE_ENV !== 'test') {
  httpServer.listen(PORT, () => {
    console.log(`Realtime engine streaming on http://localhost:${PORT}`);
  });
}

export { app };
