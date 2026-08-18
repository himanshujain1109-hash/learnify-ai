import { GoogleGenAI } from "@google/genai";

function client() {
  if(!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");
  return new GoogleGenAI({ apiKey:process.env.GEMINI_API_KEY });
}

const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

export async function generateJSON(prompt) {
  const ai=client();
  const response=await ai.models.generateContent({
    model,
    contents:prompt,
    config:{responseMimeType:"application/json"}
  });
  return JSON.parse(response.text);
}

export async function generateText(prompt) {
  const ai=client();
  const response=await ai.models.generateContent({model,contents:prompt});
  return response.text;
}