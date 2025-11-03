import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { handleIncomingTelex } from './controllers/telex.controller.js';
import { initScheduler } from './utils/scheduler.js';

dotenv.config();

const app = express();
app.use(bodyParser.json());

// Health check
app.get('/', (req, res) => res.send('DevTask agent is alive and healthy '));

// Webhook endpoint Telex will call
app.post('/telex/webhook', handleIncomingTelex);

// Admin endpoint to list recent tasks
app.get('/admin/tasks', async (req, res) => {
  try {
    const Task = (await import('./models/task.model.js')).default;
    const tasks = await Task.find().sort({ createdAt: -1 }).limit(200);
    res.json(tasks);
  } catch (err) {
    console.error('Failed to fetch tasks:', err.message || err);
    res.status(500).json({ error: 'Could not fetch tasks' });
  }
});

// Use the dynamic port 
const PORT = process.env.PORT || 6999;
const MONGO_URI = process.env.MONGO_URI;

// Initialize server
(async () => {
  try {
    if (!MONGO_URI) {
      console.error('MONGO_URI missing in .env please set it before starting.');
      process.exit(1);
    }

    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`DevTask running and listening on port ${PORT}`);
      initScheduler();
    });
  } catch (err) {
    console.error('MongoDB connection error:', err.message || err);
    process.exit(1);
  }
})();
