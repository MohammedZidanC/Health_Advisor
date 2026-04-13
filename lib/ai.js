async function generateAIResponse(prompt) {
  const accountId = "84d53ebe4821a38548ea834e8a98a7d4";
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  
  if (!apiToken) {
    throw new Error("CLOUDFLARE_API_TOKEN is not set in environment variables");
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/meta/llama-3-8b-instruct`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + apiToken,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      messages: [
        { role: "user", content: prompt }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Cloudflare AI error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  
  if (!data.success || !data.result || !data.result.response) {
    throw new Error("Invalid response format from Cloudflare API");
  }

  return data.result.response;
}

module.exports = { generateAIResponse };
