const { generateAIResponse } = require("../lib/gemini");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

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

    return res.status(200).json(result);
  } catch (err) {
    console.error("Analyze error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
