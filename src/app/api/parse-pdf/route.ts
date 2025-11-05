import { NextRequest, NextResponse } from "next/server";

import { Expense } from "@/entities/Expense";
import {
  DEFAULT_CATEGORIES,
  DEFAULT_TAGS,
  GEMINI_PDF_RULES,
} from "@/lib/config";
import { genAI } from "@/lib/gemini";

type AITransaction = {
  date: string;
  description: string;
  amount: number;
  categoryId?: string;
  categoryName?: string;
};

export async function POST(request: NextRequest) {
  try {
    // Check if Gemini is configured
    if (!genAI) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");

    // Create prompt with category matching
    const prompt = `
You are a bank statement parser. Extract ALL transactions from this PDF bank statement.

Available categories to match:
${DEFAULT_CATEGORIES.map((c) => `- ${c.name} (id: ${c.id})`).join("\n")}

Available tags to match (Tags are locations where the expense was made at)
${DEFAULT_TAGS.map((t) => `- ${t.name} (id: ${t.id})`).join("\n")}

Return ONLY a valid JSON array (no markdown, no code blocks):
Example:
[
  {
    "date": "YYYY-MM-DD",
    "description": "Merchant/payee name",
    "amount": 123.45,
    "categoryId": "1",
    "tagId: "costco",
    "memberId": "1"
  }
]

${GEMINI_PDF_RULES}

Extract all transactions now.`;

    // Use Gemini Flash (free tier)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-001" });

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64,
          mimeType: file.type,
        },
      },
      prompt,
    ]);

    const response = await result.response;
    const text = response.text();

    // Parse JSON response
    let transactions;
    try {
      // Remove markdown code blocks if present
      const cleaned = text
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      transactions = JSON.parse(cleaned);
    } catch (error: unknown) {
      console.error("Failed to parse AI response:", text);
      return NextResponse.json(
        { details: text, error: `Failed to parse AI response: ${error}` },
        { status: 500 },
      );
    }

    // Validate and transform to Expense format
    const expenses: Expense[] = (transactions as AITransaction[]).map(
      (t, index) => ({
        amount: Math.abs(parseFloat(String(t.amount))),
        categoryId: t.categoryId || "3",
        createdAt: new Date(),
        date: new Date(t.date),
        description: t.description || "",
        id: `temp-${Date.now()}-${index}`,
        memberId: "1",
        tagId: null,
        updatedAt: new Date(),
      }),
    );

    return NextResponse.json({
      count: expenses.length,
      expenses,
      success: true,
    });
  } catch (error: unknown) {
    console.error("PDF parsing error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    // Check for rate limit error
    if (
      errorMessage.includes("429") ||
      errorMessage.includes("rate limit") ||
      errorMessage.includes("quota")
    ) {
      return NextResponse.json(
        {
          code: "RATE_LIMIT",
          details: "You've hit the API rate limit. Please try again later.",
          error: "Rate limit exceeded",
        },
        { status: 429 },
      );
    }

    return NextResponse.json(
      { details: errorMessage, error: "Failed to parse PDF" },
      { status: 500 },
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
