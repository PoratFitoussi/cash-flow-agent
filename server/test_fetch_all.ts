import * as dotenv from 'dotenv';
dotenv.config();

async function test() {
  let url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`;
  let hasNext = true;
  while(hasNext) {
    const res = await fetch(url);
    const json = await res.json();
    for (const model of json.models || []) {
      if (model.name.includes("flash")) {
         console.log(model.name);
      }
    }
    if (json.nextPageToken) {
      url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}&pageToken=${json.nextPageToken}`;
    } else {
      hasNext = false;
    }
  }
}
test();
