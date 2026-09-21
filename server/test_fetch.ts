import * as dotenv from 'dotenv';
dotenv.config();

async function test() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`;
  const res = await fetch(url);
  const json = await res.json();
  console.log(JSON.stringify(json, null, 2));
}
test();
