// Polls DB every minute and sends reminders for due tasks.

import cron from 'node-cron';
import Task from '../models/task.model.js';
import { sendToTelex } from '../services/telex.service.js';

export const initScheduler = () => {
  console.log('Scheduler starting — checking every minute for due tasks');

  // run every minute
  cron.schedule('*/1 * * * *', async () => {
    try {
      const now = new Date();

      // Find tasks that are due (when <= now) and not yet reminded
      const dueTasks = await Task.find({
        reminded: false,
        when: { $lte: now }
      });

      for (const t of dueTasks) {
        try {
          const message = `Reminder: you planned to "${t.task}" (scheduled for ${new Date(t.when).toLocaleString()})`;
          await sendToTelex(t.user, message);

          t.reminded = true;
          t.remindedAt = new Date();
          await t.save();

          console.log(`[scheduler] Reminded ${t.user} about "${t.task}"`);
        } catch (err) {
          console.error('[scheduler] Failed to send reminder for task', t._id, err?.message || err);
        }
      }
    } catch (err) {
      console.error('[scheduler] Error while checking for due tasks:', err?.message || err);
    }
  });
};

// small helper kept for clarity (controller logs scheduling)
export const scheduleReminder = (task) => {
  console.log(`[scheduler] Task scheduled: "${task.task}" at ${new Date(task.when).toLocaleString()}`);
};
