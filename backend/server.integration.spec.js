import test from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from './server.js';
import { Task } from './task.model.js';

test('Backend Express-to-MongoDB Integration Suite', async (t) => {
  
  // Establish an isolated connection to a test sandbox database
  t.before(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect('mongodb://127.0.0.1:27017/realtime_board_integration_db');
    }
    await Task.init();
  });

  // Wipe data clean between isolated test calls to ensure state cleanliness
  t.beforeEach(async () => {
    await Task.deleteMany({});
  });

  // Safely close connections when testing loops conclude
  t.after(async () => {
    await mongoose.connection.close();
  });

  await t.test('POST /api/tasks should validate, store record in MongoDB, and return 201', async () => {
    const freshTaskPayload = {
      title: 'Integration Test Task',
      description: 'Verifying full-stack boundary crossing',
      assignedTo: 'Supertest Engine',
      points: 5
    };

    // 1. Fire a live mock HTTP request at your Express app instance
    const response = await request(app)
      .post('/api/tasks')
      .send(freshTaskPayload)
      .set('Accept', 'application/json');

    // 2. Assert HTTP transport status layer responded with a Created status
    assert.strictEqual(response.status, 201);
    assert.strictEqual(response.body.title, 'Integration Test Task');

    // 3. Query MongoDB directly to guarantee the record actually saved to disk
    const savedDatabaseRecord = await Task.findOne({ title: 'Integration Test Task' });
    
    assert.ok(savedDatabaseRecord);
    assert.strictEqual(savedDatabaseRecord.assignedTo, 'Supertest Engine');
    assert.strictEqual(savedDatabaseRecord.points, 5);
  });
});
