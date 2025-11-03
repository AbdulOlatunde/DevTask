// Use chrono-node to parse natural language times and simple heuristics to extract the task text.

import * as chrono from 'chrono-node';


/*
  extractTask(text)
  Returns { task: string, when: Date, humanTime: string } or null if no reasonable task is found.
 */
export const extractTask = (text) => {
  if (!text || typeof text !== 'string') return null;

  // Quick normalization
  const original = text.trim();
  const lower = original.toLowerCase();

  // Heuristics: look for common task triggers
  const triggerRegex = /\b(remind me to|i'll|i will|i'm going to|i am going to|please (?:remind )?me to|i'll try to|i'll try)\b/i;
  const verbRegex = /\b(finish|fix|complete|deploy|release|implement|update|write|review|build|investigate|test)\b/i;

  const hasTrigger = triggerRegex.test(lower);
  const hasVerb = verbRegex.test(lower);

  // Parse dates/times with chrono
  const parsedDates = chrono.parse(original);
  let whenDate = null;
  let humanTime = '';

  if (parsedDates && parsedDates.length > 0) {
    // Use first recognized date
    whenDate = parsedDates[0].start.date();
    humanTime = parsedDates[0].text || whenDate.toLocaleString();
  }

  // Derive task text:
  // If user used "remind me to X" or "I'll X", capture that phrase.
  let taskText = null;

  const remindMatch = original.match(/(?:remind me to|please remind me to)\s+(.+)/i);
  if (remindMatch && remindMatch[1]) {
    taskText = remindMatch[1].trim();
  }

  if (!taskText) {
    const illMatch = original.match(/(?:i(?:'ll| will| am going to|'\s?m going to))\s+(.+)/i);
    if (illMatch && illMatch[1]) {
      taskText = illMatch[1].trim();
    }
  }

  if (!taskText && hasVerb) {
    // fallback: try to capture verb + noun chunk up to 'by'/'at' etc.
    const verbChunk = original.match(/(?:\b(?:finish|fix|complete|deploy|implement|update|write|review|build|investigate|test)\b.+?)(?:\s+by|\s+at|\s+tomorrow|\s+on|$)/i);
    if (verbChunk && verbChunk[0]) taskText = verbChunk[0].trim();
  }

  // If none of those worked, try to take everything before the date expression as the task
  if (!taskText && parsedDates && parsedDates.length > 0 && parsedDates[0].index != null) {
    const before = original.slice(0, parsedDates[0].index).trim();
    if (before.length > 0) {
      taskText = before.replace(/\b(i will|i'll|remind me to|please remind me to)\b/i, '').trim();
    }
  }

  // If still missing, but the message looked like a task due to triggers/verbs, accept full message as task
  if (!taskText && (hasTrigger || hasVerb)) {
    taskText = original;
  }

  // If still nothing, bail out, not clearly a task
  if (!taskText) return null;

  // If no datetime found, default sensibly: 1 hour from now
  if (!whenDate) {
    const d = new Date();
    d.setHours(d.getHours() + 1, 0, 0, 0);
    whenDate = d;
    humanTime = 'in ~1 hour';
  }

  return {
    task: taskText,
    when: whenDate,
    humanTime
  };
};
