import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3005;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

async function generateAIResponse(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment variables");
  }

  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: prompt }
          ]
        }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  
  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts.length) {
    throw new Error("Invalid response format from Gemini API");
  }

  return data.candidates[0].content.parts[0].text;
}

// ==================== POST /analyze ====================
app.post("/analyze", async (req, res) => {
  const { symptoms } = req.body;

  if (!symptoms || symptoms.trim() === "") {
    return res.status(400).json({ error: "No symptoms provided" });
  }

  const prompt = `You are a medical assistant AI.

Analyze the given symptoms carefully and logically.

Rules:
- Do NOT guess randomly
- Be cautious and realistic
- If symptoms indicate serious condition, mark riskLevel as HIGH
- If unsure, choose the most probable common condition
- Return ONLY JSON. No extra text.

The patient reports: "${symptoms}"

Format:
{
  "disease": "",
  "riskLevel": "Low/Medium/High",
  "riskPercent": number,
  "emergency": "",
  "specialist": ""
}`;

  try {
    const rawText = await generateAIResponse(prompt);

    let result = null;
    try {
      const start = rawText.indexOf("{");
      const end = rawText.lastIndexOf("}");
      if (start !== -1 && end !== -1) {
        result = JSON.parse(rawText.substring(start, end + 1));
      }
    } catch (parseErr) {
      console.warn("JSON parse failed:", parseErr.message);
    }

    if (!result || !result.disease) {
      return res.status(500).json({ error: "Invalid AI response", raw: rawText });
    }

    res.json(result);
  } catch (err) {
    console.error("Analyze error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ==================== CHAT HISTORY (in-memory) ====================
const MAX_HISTORY = 5; // Keep last 5 exchanges (10 messages)
const chatHistory = []; // [ { role: "user"|"assistant", content: "..." }, ... ]

// ==================== POST /chat ====================
app.post("/chat", async (req, res) => {
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

    res.json({ response: reply });
  } catch (err) {
    console.error("[CHAT] Error:", err.message);
    chatHistory.pop();
    res.status(500).json({ error: err.message });
  }
});

// ==================== START ====================
app.listen(PORT, () => {
  console.log(`\n✅ Health Advisor running at http://localhost:${PORT}`);
  console.log(`🤖 Using Gemini API\n`);
});
