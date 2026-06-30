import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  status: { type: String, enum: ['todo', 'progress', 'done'], default: 'todo' },
  assignedTo: { type: String, required: true },
  points: { type: Number, default: 1, min: 1 }
}, { timestamps: true });

export const Task = mongoose.model('Task', taskSchema);
