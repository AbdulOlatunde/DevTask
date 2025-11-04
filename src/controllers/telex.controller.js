import { askMastra } from "../mastraAgent.js";
import { extractTask } from "../utils/parser.js";
import Task from "../models/task.model.js";
import { scheduleReminder } from "../utils/scheduler.js";
import { randomUUID } from "crypto";

/*
 * handleIncomingTelex
 * A2A-compliant webhook for Telex messages
 */
export const handleIncomingTelex = async (req, res) => {
  try {
    const { jsonrpc, id: requestId, method, params } = req.body;

    // Validate JSON-RPC structure
    if (jsonrpc !== "2.0" || !requestId) {
      return res.status(400).json({
        jsonrpc: "2.0",
        id: requestId || null,
        error: {
          code: -32600,
          message: 'Invalid Request: "jsonrpc" must be "2.0" and "id" is required',
        },
      });
    }

    // Extract message text from A2A format
    const message =
      params?.message?.parts?.[0]?.text ||
      params?.message?.text ||
      "No message provided";

    const user =
      params?.message?.sender || params?.sender || "unknown-user";

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        jsonrpc: "2.0",
        id: requestId,
        error: { code: -32602, message: "No message provided" },
      });
    }

    // Let Mastra reason or add context
    const agentResponse = await askMastra(message);

    // Try extracting a task
    const parsed = extractTask(message);

    let replyText;

    if (!parsed) {
      replyText =
        agentResponse.output ||
        `I didn’t detect a clear task. Try: “Remind me to test API at 6pm.”`;
    } else {
      // Persist the new task
      const newTask = await Task.create({
        user,
        task: parsed.task,
        when: parsed.when,
        humanTime: parsed.humanTime,
      });

      // Schedule the reminder
      scheduleReminder(newTask);

      replyText = `Got it! I’ll remind you to “${newTask.task}” (${parsed.humanTime || new Date(newTask.when).toLocaleString()}).`;
    }

    // A2A success response
    return res.json({
      jsonrpc: "2.0",
      id: requestId,
      result: {
        id: randomUUID(),
        contextId: randomUUID(),
        status: {
          state: "completed",
          timestamp: new Date().toISOString(),
          message: {
            messageId: randomUUID(),
            role: "agent",
            parts: [{ kind: "text", text: replyText }],
            kind: "message",
          },
        },
        artifacts: [
          {
            artifactId: randomUUID(),
            name: "DevTaskResponse",
            parts: [{ kind: "text", text: replyText }],
          },
        ],
        history: [
          {
            kind: "message",
            role: "user",
            parts: params?.message?.parts || [
              { kind: "text", text: message },
            ],
            messageId:
              params?.message?.messageId || randomUUID(),
            taskId:
              params?.message?.taskId || randomUUID(),
          },
          {
            kind: "message",
            role: "agent",
            parts: [{ kind: "text", text: replyText }],
            messageId: randomUUID(),
            taskId: randomUUID(),
          },
        ],
        kind: "task",
      },
    });
  } catch (err) {
    console.error("[telex.controller] Error:", err.message || err);
    return res.status(500).json({
      jsonrpc: "2.0",
      id: null,
      error: {
        code: -32603,
        message: "Internal error",
        data: { details: err.message },
      },
    });
  }
};
