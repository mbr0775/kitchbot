
import { GoogleGenAI } from "@google/genai";

const geminiApiKey = process.env.GEMINI_API_KEY;

if (!geminiApiKey) {
  throw new Error("Missing GEMINI_API_KEY");
}

export const gemini = new GoogleGenAI({
  apiKey: geminiApiKey,
});

export async function generateKitchBotReply(prompt: string) {
  const response = await gemini.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return (
    response.text ||
    "Sorry, I could not generate a reply right now. Please try again."
  );
}