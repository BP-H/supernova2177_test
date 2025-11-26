import { NextResponse } from "next/server";
import OpenAI from "openai";

let openai;

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return null;
  }

  if (!openai) {
    openai = new OpenAI({ apiKey });
  }

  return openai;
}

export async function POST(request) {
  try {
    const { prompt } = await request.json();

    const openaiClient = getOpenAIClient();
    if (!openaiClient) {
      return NextResponse.json(
        { reply: "Missing OPENAI_API_KEY environment variable." },
        { status: 500 }
      );
    }

    const completion = await openaiClient.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const reply = completion.choices[0].message.content;
    return NextResponse.json({ reply });
  } catch (error) {
    return NextResponse.json(
      { reply: "OpenAI API error: " + error.message },
      { status: 500 }
    );
  }
}