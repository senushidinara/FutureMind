import { GoogleGenAI, Chat, Type } from "@google/genai";
import { ChatMessage, AnalysisResult } from "../types";

// Service is now stateless. AI client is initialized on demand.
let ai: GoogleGenAI | null = null;
let currentApiKey: string | null = null;

const initializeAi = (apiKey: string): GoogleGenAI => {
  if (ai && currentApiKey === apiKey) {
    return ai;
  }
  if (!apiKey) {
    throw new Error("API Key is required to initialize the AI client.");
  }
  ai = new GoogleGenAI({ apiKey });
  currentApiKey = apiKey;
  return ai;
};

export const startChatSession = (apiKey: string): Chat => {
  const aiInstance = initializeAi(apiKey);
  const chat = aiInstance.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: `You are FutureMind AI, a personal psychic, therapist, and life coach. Your purpose is to understand the user through a deep, ongoing conversation. You will ask smart, insightful, and sometimes challenging questions to uncover their personality, fears, dreams, and behavioral patterns.

Your primary goal is NOT to give quick answers, but to guide the user on a journey of self-discovery. After a meaningful exchange, the user may request an analysis. Until then, focus on the conversation.

Your personality is:
- Wise and insightful, like a mentor.
- Empathetic and understanding, like a therapist.
- Slightly futuristic and mysterious, but always grounded in science and psychology.
- You never break character. You are FutureMind AI. Start the conversation by introducing yourself and asking your first question.`,
    },
  });
  return chat;
};

export const sendMessage = async (chat: Chat, message: string): Promise<string> => {
  if (!chat) {
    throw new Error("Chat session is not initialized.");
  }
  if (!message.trim()) {
    return "Please enter a message.";
  }

  try {
    const response = await chat.sendMessage({ message });
    return response.text;
  } catch (error) {
    console.error("Error sending message to AI:", error);
    return "An error occurred while communicating with the AI. Please check your API key and network connection.";
  }
};

export const getAnalysis = async (apiKey: string, history: ChatMessage[]): Promise<AnalysisResult> => {
  const aiInstance = initializeAi(apiKey);
  const conversationHistory = history.map(msg => `${msg.role}: ${msg.content}`).join('\n');
  const analysisPrompt = `As FutureMind AI, conduct a deep psychological and behavioral analysis based on the entirety of our conversation below. Your analysis must be grounded in established psychological principles.

Conversation History:
${conversationHistory}

---
ANALYSIS INSTRUCTIONS:
1.  **Personality Summary**: Synthesize the user's personality based on the Big Five (OCEAN) model. Identify their dominant traits and how they manifest in their words.
2.  **Predictions**: Generate statistical future projections. For each area (e.g., Career, Relationships, Personal Growth), provide a probability and a concise outlook based on their revealed behavioral patterns and personality.
3.  **Behavioral Insights**: Identify key behavioral patterns. Explicitly look for common cognitive biases (e.g., confirmation bias, sunk cost fallacy, etc.) and comment on their learning agility, emotional intelligence, and risk tolerance.
4.  **Truth Detection**: Based on any detected hesitations, contradictions, or shifts in tone revealed in the text, provide a single, powerful insight about a potential hidden truth or underlying motivation the user may not be fully aware of.

Now, generate the analysis strictly following the requested JSON schema.`;

  const analysisSchema = {
    type: Type.OBJECT,
    properties: {
      personalitySummary: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          traits: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                trait: { type: Type.STRING },
                level: { type: Type.STRING },
                description: { type: Type.STRING },
              },
              required: ['trait', 'level', 'description'],
            },
          },
        },
        required: ['title', 'description', 'traits'],
      },
      predictions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            area: { type: Type.STRING },
            probability: { type: Type.NUMBER },
            outlook: { type: Type.STRING },
          },
          required: ['area', 'probability', 'outlook'],
        },
      },
      behavioralInsights: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          insights: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ['title', 'insights'],
      },
      truthDetection: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          analysis: { type: Type.STRING },
        },
        required: ['title', 'analysis'],
      },
    },
    required: ['personalitySummary', 'predictions', 'behavioralInsights', 'truthDetection'],
  };
  
  try {
    const response = await aiInstance.models.generateContent({
      model: "gemini-2.5-flash",
      contents: analysisPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
      },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as AnalysisResult;
  } catch (error) {
    console.error("Error getting analysis from AI:", error);
    throw new Error("Failed to generate analysis. Please check your API key and the console for details.");
  }
};