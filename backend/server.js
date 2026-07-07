import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { Task } from './task.model.js';
import { Activity } from './activity.model.js';

const app = express();
const PORT = 3000;
const dbName = process.env.NODE_ENV === 'test' ? 'realtime_board_integration_db' : 'realtime_board';

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: 'http://localhost:4200', methods: ['GET', 'POST', 'PATCH'] }
});

app.use(cors({ origin: 'http://localhost:4200' }));
app.use(express.json());

mongoose.connect(`mongodb://127.0.0.1:27017/${dbName}`)
  .then(() => {
    // Suppress console logs during testing to keep the pipeline runner clean
    if (process.env.NODE_ENV !== 'test') {
      console.log(`🍃 MongoDB Connected Successfully to: ${dbName}`);
    }
  })
  .catch(err => console.error('MongoDB connection error:', err));

app.get('/api/activities', async (req, res) => {
// Fetch the 10 most recent system logs
const history = await Activity.find().sort({ timestamp: -1 }).limit(10);
res.json(history);
});

app.get('/api/tasks', async (req, res) => {
  const tasks = await Task.find();
  res.json(tasks);
});

app.post('/api/tasks', async (req, res) => {
  const newTask = new Task(req.body);
  await newTask.save();

  // Generate and broadcast the audit entry
  const log = new Activity({
    action: 'CREATED',
    details: `Task "${newTask.title}" was added by ${newTask.assignedTo}.`
  });
  await log.save();

  io.emit('taskCreated', newTask);
  io.emit('activityLogged', log); // Stream to the audit feed panel
  res.status(201).json(newTask);
});

app.patch('/api/tasks/:id', async (req, res) => {
  // Extract status and the user name from the request body
  const { status, updatedBy } = req.body;
  
  const updatedTask = await Task.findByIdAndUpdate(
    req.params.id, 
    { status }, 
    { new: true }
  );
  
  // Create an audit entry that explicitly credits the user who performed the move
  const log = new Activity({
    action: 'STATUS_CHANGE',
    details: `Task "${updatedTask.title}" shifted to column: ${updatedTask.status} by ${updatedBy || 'an unknown user'}.`
  });
  await log.save();

  io.emit('taskUpdated', updatedTask);
  io.emit('activityLogged', log); 
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

app.delete('/api/tasks', async (req, res) => {
  // Wipe both the tasks ledger and the audit collections clean
  await Task.deleteMany({});
  await Activity.deleteMany({});
  
  // Broadcast a global socket message telling all open windows to reset back to zero
  io.emit('boardPurged');
  res.json({ message: 'Database wiped successfully.' });
});

if (process.env.NODE_ENV !== 'test') {
  httpServer.listen(PORT, () => {
    console.log(`Realtime engine streaming on http://localhost:${PORT}`);
  });
}

export { app };
