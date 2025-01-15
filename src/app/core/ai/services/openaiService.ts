// src/app/core/ai/services/analysisService.ts
import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

type Role = 'system' | 'user' | 'assistant';

interface ChatMessage {
  role: Role;
  content: string;
}

interface ChatCompletionOptions {
  temperature?: number;
  max_tokens?: number;
  model?: string;
}

class OpenAIService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async generateChatCompletion(
    messages: ChatMessage[], 
    options: ChatCompletionOptions = {}
  ) {
    try {
      const formattedMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      })) as ChatCompletionMessageParam[];

      const completion = await this.client.chat.completions.create({
        model: options.model || "gpt-4",
        messages: formattedMessages,
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 1000,
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('Error in OpenAI chat completion:', error);
      throw error;
    }
  }

  async analyzeImage(imageUrl: string, prompt: string) {
    try {
      const completion = await this.client.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt
              },
              {
                type: "image_url",
                image_url: { 
                  url: imageUrl,
                  detail: "high"
                }
              }
            ] as unknown as string
          }
        ],
        max_tokens: 1000,
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('Error in OpenAI image analysis:', error);
      throw error;
    }
  }
}

export { OpenAIService, type ChatMessage, type ChatCompletionOptions };

const openAIService = new OpenAIService();
export default openAIService;