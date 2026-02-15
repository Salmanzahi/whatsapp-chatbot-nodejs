/**
 * OpenRouter API Client
 * Converted from Python openrouter.py
 */
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// Available models
export const MODELS = [
  "openai/gpt-4",
  "deepseek/deepseek-chat",
  "anthropic/claude-3-opus",
  "anthropic/claude-3-sonnet",
  "anthropic/claude-3-haiku",
  "google/gemini-pro",
  "meta-llama/llama-3-70b",
  "mistralai/mistral-large",
  "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",
];

export const EMBEDDING_MODEL = "openai/text-embedding-3-small";

/**
 * Simple client to talk to OpenRouter AI API
 */
export class OpenRouterClient {
  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY;
    if (!this.apiKey) {
      throw new Error("Please add OPENROUTER_API_KEY to your .env file");
    }

    this.baseUrl = "https://openrouter.ai/api/v1";
    this.headers = {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
    };
  }

  /**
   * Send a message to the AI and get a response
   * @param {string} userMessage - User's message
   * @param {string} model - Model to use
   * @param {number} maxTokens - Maximum tokens in response
   * @returns {Promise<[string, object]>} - AI response and full response data
   */
  async chat(userMessage, model, maxTokens = 1000) {
    const url = `${this.baseUrl}/chat/completions`;
    const messages = [{ role: "user", content: userMessage }];

    const data = {
      model: model,
      messages: messages,
      max_tokens: maxTokens,
    };

    try {
      const response = await axios.post(url, data, { headers: this.headers });
      const responseData = response.data;
      const aiMessage = responseData.choices[0].message.content;
      return [aiMessage, responseData];
    } catch (error) {
      console.error(
        "[OpenRouter] Chat error:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  /**
   * Generate an embedding for a given text
   * @param {string} text - Text to embed
   * @returns {Promise<number[]>} - Embedding vector
   */
  async embedding(text) {
    const url = `${this.baseUrl}/embeddings`;
    const data = {
      model: EMBEDDING_MODEL,
      input: text,
    };

    try {
      const response = await axios.post(url, data, { headers: this.headers });
      const responseData = response.data;
      return responseData.data[0].embedding;
    } catch (error) {
      console.error(
        "[OpenRouter] Embedding error:",
        error.response?.data || error.message
      );
      throw error;
    }
  }
}

export default OpenRouterClient;
