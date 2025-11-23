import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

// OpenAI client for ChatGPT
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Anthropic client for Claude
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface AIMessage {
  role: "user" | "assistant";
  content: string;
}

export async function callChatGPT(
  message: string,
  history: AIMessage[] = []
): Promise<string> {
  try {
    const messages = [
      ...history.map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
      { role: "user" as const, content: message },
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
      max_tokens: 500,
    });

    return response.choices[0]?.message?.content || "No response";
  } catch (error: any) {
    console.error("ChatGPT error:", error);
    return `Error: ${error.message || "ChatGPT API failed"}`;
  }
}

export async function callClaude(
  message: string,
  history: AIMessage[] = []
): Promise<string> {
  try {
    const messages = [
      ...history.map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
      { role: "user" as const, content: message },
    ];

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 500,
      messages,
    });

    const content = response.content[0];
    if (content.type === "text") {
      return content.text;
    }
    return "No response";
  } catch (error: any) {
    console.error("Claude error:", error);
    return `Error: ${error.message || "Claude API failed"}`;
  }
}

export async function callDeepSeek(
  message: string,
  history: AIMessage[] = []
): Promise<string> {
  try {
    // DeepSeek uses OpenAI-compatible API
    const deepseek = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: "https://api.deepseek.com",
    });

    const messages = [
      ...history.map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
      { role: "user" as const, content: message },
    ];

    const response = await deepseek.chat.completions.create({
      model: "deepseek-chat",
      messages,
      max_tokens: 500,
    });

    return response.choices[0]?.message?.content || "No response";
  } catch (error: any) {
    console.error("DeepSeek error:", error);
    return `Error: ${error.message || "DeepSeek API failed"}`;
  }
}

export async function callGemini(
  message: string,
  history: AIMessage[] = []
): Promise<string> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Gemini API key not configured");
    }

    // Convert history to Gemini format
    const contents = [
      ...history.map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      })),
      {
        role: "user",
        parts: [{ text: message }],
      },
    ];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error?.message || `API request failed: ${response.status}`
      );
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error("No response from Gemini");
    }

    return text;
  } catch (error: any) {
    console.error("Gemini error:", error);
    return `Error: ${error.message || "Gemini API failed"}`;
  }
}

export async function callAI(
  model: string,
  message: string,
  history: AIMessage[] = []
): Promise<string> {
  switch (model) {
    case "ChatGPT":
      return callChatGPT(message, history);
    case "Claude":
      return callClaude(message, history);
    case "DeepSeek":
      return callDeepSeek(message, history);
    case "Gemini":
      return callGemini(message, history);
    default:
      return `Model ${model} not implemented yet`;
  }
}
