
import { GoogleGenAI } from "@google/genai";
import { Account, Transaction } from "../types";

export const analyzeFinances = async (accounts: Account[], transactions: Transaction[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const accountsSummary = accounts.map(a => `${a.name} (${a.code}): ${a.balance}`).join('\n');
  const recentTransactions = transactions.slice(-5).map(t => `${t.date} - ${t.description}`).join('\n');

  const prompt = `
    Act as a senior financial auditor and business consultant. 
    Review the following accounting data and provide a concise analysis (max 200 words).
    Highlight potential issues, trends, or recommendations.
    
    IMPORTANT: You must write your response in Arabic language.

    Accounts Overview:
    ${accountsSummary}

    Recent Activity:
    ${recentTransactions}
    
    Provide your response in clear, professional markdown in Arabic.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "عذراً، تعذر إنشاء التحليل في الوقت الحالي.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "خطأ في الاتصال بمستشار الذكاء الاصطناعي. يرجى التحقق من الشبكة.";
  }
};
