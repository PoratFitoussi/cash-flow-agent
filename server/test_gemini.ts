import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function test() {
  const models = ['gemini-1.5-flash-latest', 'gemini-1.5-flash-001', 'gemini-1.5-pro', 'gemini-pro'];
  for (const m of models) {
    try {
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent("hello");
      console.log(`${m} succeeded:`, result.response.text());
      break;
    } catch (e) {
      console.error(`${m} failed:`, e.message);
    }
  }
}
test();
