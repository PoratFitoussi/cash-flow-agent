import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI('');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
model.generateContent("hello").catch(e => console.error("Empty key error:", e.message));

const genAI2 = new GoogleGenerativeAI('AIzaSyJunkKeyHereForTestingPurposesOnly123');
const model2 = genAI2.getGenerativeModel({ model: "gemini-1.5-flash" });
model2.generateContent("hello").catch(e => console.error("Junk key error:", e.message));
