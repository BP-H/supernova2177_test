import { NextResponse } from "next/server";
import OpenAI from "openai";

const MISSING_API_KEY_MESSAGE = "Missing OPENAI_API_KEY environment variable.";

function getOpenAiClient() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(MISSING_API_KEY_MESSAGE);
  }

  return new OpenAI({ apiKey });
}

export async function POST(request) {
  try {
    const { prompt } = await request.json();
    const openai = getOpenAiClient();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const reply = completion.choices[0].message.content;
    return NextResponse.json({ reply });
  } catch (error) {
    const message =
      error?.message === MISSING_API_KEY_MESSAGE
        ? MISSING_API_KEY_MESSAGE
        : "OpenAI API error: " + error.message;

    return NextResponse.json({ reply: message }, { status: 500 });
  }
}