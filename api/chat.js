const { generateAIResponse } = require("../lib/gemini");

// ==================== CHAT HISTORY (in-memory) ====================
// Note: In a Serverless environment, this will reset when the function cold-starts.
const MAX_HISTORY = 5; // Keep last 5 exchanges (10 messages)
const chatHistory = []; // [ { role: "user"|"assistant", content: "..." }, ... ]

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const userMessage = req.body.message;

  if (!userMessage || userMessage.trim() === "") {
    return res.status(400).json({ error: "No message provided" });
  }

  // Add user message to history
  chatHistory.push({ role: "user", content: userMessage });

  console.log(`[CHAT] User: "${userMessage}"`);

  // Build conversation context from history
  let conversationLines = "";
  for (const msg of chatHistory) {
    if (msg.role === "user") {
      conversationLines += `User: ${msg.content}\n`;
    } else {
      conversationLines += `AI: ${msg.content}\n`;
    }
  }

  const prompt = `You are Dr. WHO, a friendly AI health companion.

Rules:
- Be supportive and conversational
- Do NOT give final medical diagnosis
- Suggest using the diagnostic tool if needed
- Keep responses short (2-4 sentences max)
- Respond directly to the latest user message
- Use the conversation history for context

Conversation:
${conversationLines}
Respond to the latest user message.`;

  try {
    const reply = await generateAIResponse(prompt);

    console.log(`[CHAT] AI reply: "${reply.substring(0, 100)}..."`);

    if (!reply) {
      chatHistory.pop();
      return res.status(500).json({ error: "AI returned empty response" });
    }

    // Add AI reply to history
    chatHistory.push({ role: "assistant", content: reply });

    // Trim history to last 5 exchanges (10 messages)
    while (chatHistory.length > MAX_HISTORY * 2) {
      chatHistory.shift();
    }

    return res.status(200).json({ response: reply });
  } catch (err) {
    console.error("[CHAT] Error:", err.message);
    chatHistory.pop();
    return res.status(500).json({ error: err.message });
  }
}
