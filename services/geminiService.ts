
import { GoogleGenAI } from "@google/genai";
import { Winner } from "../types";

export const geminiService = {
  async generateCongratulation(winner: Winner): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate a short, enthusiastic, 1-sentence congratulatory message in Traditional Chinese for ${winner.name} from the ${winner.department} department who just won the ${winner.prizeName} in a lucky draw. Use emojis.`,
      });
      return response.text || "恭喜中獎！🎉";
    } catch (error) {
      console.error("Gemini Error:", error);
      return `恭喜 ${winner.name} 獲得 ${winner.prizeName}！🎊`;
    }
  }
};
