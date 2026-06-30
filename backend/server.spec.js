import test from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import { Task } from './task.model.js';

test('Backend Real-Time Engine Integration Suite', async (t) => {
  
  t.before(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect('mongodb://127.0.0.1:27017/realtime_board_test_db');
    }
    await Task.init();
  });

  t.beforeEach(async () => {
    await Task.deleteMany({});
  });

  t.after(async () => {
    await mongoose.connection.close();
  });

  await t.test('MongoDB Aggregation Pipeline should correctly summarize task points by status grouping', async () => {
    await Task.insertMany([
      { title: 'Task A', status: 'todo', assignedTo: 'User A', points: 3 },
      { title: 'Task B', status: 'todo', assignedTo: 'User B', points: 5 },
      { title: 'Task C', status: 'progress', assignedTo: 'User C', points: 8 }
    ]);

    const statsResult = await Task.aggregate([
      {
        $group: {
          _id: '$status',
          totalTasks: { $sum: 1 },
          totalPoints: { $sum: '$points' }
        }
      }
    ]);

    const todoGroup = statsResult.find(group => group._id === 'todo');
    const progressGroup = statsResult.find(group => group._id === 'progress');

    assert.ok(todoGroup);
    assert.strictEqual(todoGroup.totalTasks, 2);
    assert.strictEqual(todoGroup.totalPoints, 8);

    assert.ok(progressGroup);
    assert.strictEqual(progressGroup.totalTasks, 1);
    assert.strictEqual(progressGroup.totalPoints, 8);
  });
});
