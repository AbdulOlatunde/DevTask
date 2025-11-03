import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
  user: { type: String, required: true, trim: true },
  task: { type: String, required: true, trim: true },
  when: { type: Date, required: true },
  humanTime: { type: String, default: '' },
  reminded: { type: Boolean, default: false },
  createdAt: { type: Date, default: () => new Date() },
  remindedAt: { type: Date, default: null }
});

export default mongoose.models.Task || mongoose.model('Task', TaskSchema);
