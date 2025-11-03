import { Mastra } from "@mastra/core";

let agent = null;

try {
  const mastra = new Mastra({
    name: "DevTask",
    instructions: `
      You are DevTask, a short, helpful assistant that extracts tasks and times from a single message.
      If the message doesn't contain a task, reply with a short hint explaining how to create one.
    `,
    model: "gpt-4o-mini",
  });

  agent = mastra;
  console.log("Mastra agent initialized successfully");
} catch (err) {
  console.warn("Mastra initialization failed:", err?.message || err);
}

//Runs the agent safely and returns stable output.

export const askMastra = async (message) => {
  if (!agent) {
    console.warn("No active Mastra agent. Returning null output.");
    return { output: null };
  }

  try {
    const result = await agent.run({ input: message });
    const output = result?.output ?? result?.message ?? null;
    return { output };
  } catch (err) {
    console.warn("Mastra run error:", err?.message || err);
    return { output: null };
  }
};
