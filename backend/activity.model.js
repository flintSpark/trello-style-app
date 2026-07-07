import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  action: { type: String, required: true }, // e.g., 'CREATED', 'MOVED_STATUS'
  details: { type: String, required: true }, // e.g., 'Task "Fix Login" was moved to Progress'
  timestamp: { type: Date, default: Date.now }
}, { expires: '7d' }); // Automatically deletes old logs after 7 days to preserve space

export const Activity = mongoose.model('Activity', activitySchema);
