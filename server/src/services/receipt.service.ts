import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { db } from "../db";
import { transactions, transactionItems, products } from "../db/schema";
import { eq, and, sql } from "drizzle-orm";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const ReceiptSchema = z.object({
  merchantName: z.string(),
  transactionDate: z.string(),
  totalAmount: z.number(),
  lineItems: z.array(
    z.object({
      rawName: z.string(),
      quantity: z.number(),
      unitPrice: z.number(),
      totalPrice: z.number(),
    })
  ),
});

export type ReceiptData = z.infer<typeof ReceiptSchema>;

export async function parseReceiptImage(mimeType: string, base64Data: string): Promise<ReceiptData> {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: 'Extract the receipt details into structured JSON. Include merchantName, transactionDate (YYYY-MM-DD), totalAmount, and lineItems with rawName, quantity, unitPrice, and totalPrice.'
          },
          {
            inlineData: {
              mimeType,
              data: base64Data
            }
          }
        ]
      }
    ],
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'OBJECT',
        properties: {
          merchantName: { type: 'STRING' },
          transactionDate: { type: 'STRING' },
          totalAmount: { type: 'NUMBER' },
          lineItems: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                rawName: { type: 'STRING' },
                quantity: { type: 'NUMBER' },
                unitPrice: { type: 'NUMBER' },
                totalPrice: { type: 'NUMBER' }
              },
              required: ['rawName', 'quantity', 'unitPrice', 'totalPrice']
            }
          }
        },
        required: ['merchantName', 'transactionDate', 'totalAmount', 'lineItems']
      }
    }
  });

  const text = response.text();
  if (!text) throw new Error("Failed to parse receipt");
  
  const parsed = JSON.parse(text);
  return ReceiptSchema.parse(parsed);
}
