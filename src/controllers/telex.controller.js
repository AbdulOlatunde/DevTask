import { askMastra } from '../mastraAgent.js';
import { extractTask } from '../utils/parser.js';
import Task from '../models/task.model.js';
import { scheduleReminder } from '../utils/scheduler.js';
import { sendToTelex } from '../services/telex.service.js';

/**
 * handleIncomingTelex
 * Expected body: { user: string, message: string }
 */
export const handleIncomingTelex = async (req, res) => {
  try {
    const payload = req.body || {};
    const user = payload.user || payload.sender || 'unknown';
    const message = (payload.message || payload.text || '').toString();

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'No message provided' });
    }

    //let Mastra help with understanding or adding context
    const agentResponse = await askMastra(message);

    // Try to extract a task using parser
    const parsed = extractTask(message);

    if (!parsed) {
      const hint = agentResponse.output || `I didn't spot a task. Try: "I'll fix the bug by 6pm" or "Remind me to deploy tomorrow at 9am".`;
      // Attempt to reply back to Telex
      await sendToTelex(user, hint);
      return res.json({ ok: true, message: hint });
    }

    // Persist task
    const newTask = await Task.create({
      user,
      task: parsed.task,
      when: parsed.when,
      humanTime: parsed.humanTime
    });

    // Scheduler reads DB each minute, we just log/schedule
    scheduleReminder(newTask);

    const confirmation = `Got it. I'll remind you to "${newTask.task}" (${parsed.humanTime || new Date(newTask.when).toLocaleString()}).`;
    await sendToTelex(user, confirmation);

    return res.json({ ok: true, task: newTask, reply: confirmation });
  } catch (err) {
    console.error('[telex.controller] Error:', err?.message || err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
