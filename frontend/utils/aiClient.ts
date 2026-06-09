const PROXY_URL = 'http://172.16.27.120:3001/v1/chat/completions';
// Using local IP address so physical devices and emulators can connect

type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export async function fetchAIResponse(
  messages: Message[],
  apiKey: string
): Promise<string> {
  const payload = {
    messages: [
      {
        role: 'system',
        content:
          'You are a friendly, casual companion. Chat with the user as if you are a friend on a messaging app, keeping responses relatively short, empathetic, and engaging. Do not use overly formal language.',
      },
      ...messages,
    ],
  };

  try {
    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Fetch AI Response failed:', error);
    return "Sorry, I'm having trouble connecting right now! Make sure the proxy is running and you have added API keys.";
  }
}
