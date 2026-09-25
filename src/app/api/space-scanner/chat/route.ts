// SpaceAtlas — NLP Chat API
// Conversational follow-up about identified space objects.
// Maintains context of the selected object and previous messages.

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash"] as const;

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

interface ObjectContext {
  objectName: string;
  className?: string;
  category?: string;
  observation?: string;
  knowledgeSummary?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      message,
      context,
      image: rawImage,
      mimeType = "image/jpeg",
    }: {
      message: string;
      context: {
        object: ObjectContext;
        previousMessages?: ChatMessage[];
      };
      image?: string;
      mimeType?: string;
    } = body;

    if (!message || !context?.object?.objectName) {
      return NextResponse.json(
        { error: "Missing message or object context" },
        { status: 400 }
      );
    }

    const { object, previousMessages = [] } = context;

    // Build conversation history for Gemini
    const conversationHistory = previousMessages
      .map((msg) => `${msg.role === "user" ? "User" : "SpaceAtlas AI"}: ${msg.text}`)
      .join("\n\n");

    const systemPrompt = `You are SpaceAtlas AI — an expert astronomical knowledge assistant integrated into the SpaceAtlas visual search system.

CONTEXT: The user has identified **${object.objectName}** (${object.category || "space object"}) in an uploaded image using our visual scanner.
${object.observation ? `VISUAL OBSERVATION: ${object.observation}` : ""}
${object.knowledgeSummary ? `KNOWN DATA: ${object.knowledgeSummary}` : ""}

RULES:
1. Answer questions specifically about ${object.objectName} and related topics.
2. Be precise, factual, and cite numerical data when available (distances, masses, temperatures, dates).
3. Use markdown formatting for clarity — bold key terms, use bullet points for lists.
4. Keep answers concise but comprehensive — aim for 2-4 paragraphs max.
5. If the user asks about something unrelated to ${object.objectName} or space/astronomy, gently redirect them back to the astronomical context.
6. At the end of your response, suggest 2 natural follow-up questions the user might ask next.
7. If you are not confident about a specific fact, say so rather than guessing.

${conversationHistory ? `CONVERSATION SO FAR:\n${conversationHistory}\n` : ""}`;

    let responseText = "";
    let lastError: unknown = null;

    for (const modelName of GEMINI_MODELS) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 2048,
          },
        });

        // Build content parts
        const parts: Array<string | { inlineData: { data: string; mimeType: string } }> = [
          systemPrompt + `\n\nUser: ${message}`,
        ];

        // Include image if provided (for visual reference)
        if (rawImage) {
          let base64Image = rawImage;
          if (rawImage.startsWith("data:")) {
            base64Image = rawImage.split(",")[1];
          }
          if (base64Image && !rawImage.startsWith("http")) {
            parts.push({ inlineData: { data: base64Image, mimeType } });
          }
        }

        const result = await model.generateContent(parts);
        responseText = result.response.text();
        if (responseText) break;
      } catch (err) {
        lastError = err;
      }
    }

    if (!responseText) {
      throw new Error(`Chat failed: ${(lastError as Error)?.message || "Unknown error"}`);
    }

    // Extract suggested follow-ups from the response
    // The model is instructed to add them at the end
    const suggestedFollowups = extractFollowups(responseText, object.objectName);

    return NextResponse.json({
      answer: responseText,
      suggestedFollowups,
      objectName: object.objectName,
    });
  } catch (error: unknown) {
    console.error("[CHAT_ERROR]", error);
    return NextResponse.json(
      {
        error: "Failed to generate response",
        answer: "I encountered an error processing your question. Please try again.",
        details: (error as Error)?.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}

/**
 * Try to extract follow-up question suggestions from the model response.
 * Falls back to generic suggestions if extraction fails.
 */
function extractFollowups(response: string, objectName: string): string[] {
  // Look for lines that look like questions near the end of the response
  const lines = response.split("\n").filter((l) => l.trim());
  const questionLines = lines.filter(
    (l) =>
      l.trim().endsWith("?") &&
      (l.trim().startsWith("-") || l.trim().startsWith("•") || l.trim().startsWith("*") || /^\d/.test(l.trim()))
  );

  if (questionLines.length >= 2) {
    return questionLines.slice(-3).map((l) =>
      l.replace(/^[\s\-•*\d.]+/, "").trim()
    );
  }

  // Generic fallbacks
  return [
    `What makes ${objectName} unique?`,
    `What are recent discoveries about ${objectName}?`,
  ];
}
