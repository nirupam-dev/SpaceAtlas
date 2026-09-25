// SpaceAtlas — NLP Chat API
// Conversational follow-up about identified space objects.
// Maintains context of the selected object and previous messages.

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const GEMINI_MODELS = [
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-3.8-flash",
] as const;

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
  knowledgeDetails?: Record<string, string | number | boolean | undefined>;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      message,
      context,
    }: {
      message: string;
      context: {
        object: ObjectContext;
        previousMessages?: ChatMessage[];
      };
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

    // Build specifications string from details
    const specsString = object.knowledgeDetails
      ? Object.entries(object.knowledgeDetails)
          .filter(([, v]) => v !== undefined && v !== null && v !== "")
          .map(([k, v]) => `- ${k}: ${v}`)
          .join("\n")
      : "";

    const systemPrompt = `You are SpaceAtlas AI — an expert astronomical knowledge assistant integrated into the SpaceAtlas visual search system.

CONTEXT: The user has identified **${object.objectName}** (${object.category || "space object"}) in an uploaded image using our visual scanner.
${object.observation ? `VISUAL OBSERVATION: ${object.observation}` : ""}
${object.knowledgeSummary ? `DESCRIPTION: ${object.knowledgeSummary}` : ""}
${specsString ? `\nSPECIFICATIONS:\n${specsString}` : ""}

RULES:
1. Answer questions specifically about ${object.objectName} and related topics.
2. Be precise, factual, and ALWAYS cite the numerical data from SPECIFICATIONS when available (distances, masses, temperatures, dates). Never say "data is not provided" if it exists in SPECIFICATIONS above.
3. Use markdown formatting for clarity — bold key terms, use bullet points for lists.
4. Keep answers concise but comprehensive — aim for 2-4 paragraphs max.
5. If the user asks about something unrelated to ${object.objectName} or space/astronomy, gently redirect them back to the astronomical context.
6. At the end of your response, suggest 2 natural follow-up questions the user might ask next.
7. If you are not confident about a specific fact, say so rather than guessing.

${conversationHistory ? `CONVERSATION SO FAR:\n${conversationHistory}\n` : ""}`;

    let responseText = "";
    let lastError: unknown = null;

    // Try each model with a retry per model
    const modelsToTry = GEMINI_MODELS;

    for (const modelName of modelsToTry) {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens: 1024,
            },
          });

          // Build content parts (text only — no image for chat, keeps it fast)
          const parts: Array<string | { inlineData: { data: string; mimeType: string } }> = [
            systemPrompt + `\n\nUser: ${message}`,
          ];

          const result = await model.generateContent(parts);
          responseText = result.response.text();
          if (responseText) break;
        } catch (err) {
          lastError = err;
          console.error(`[CHAT] ${modelName} attempt ${attempt + 1} failed:`, (err as Error)?.message);
          // Wait before retry
          if (attempt === 0) await new Promise((r) => setTimeout(r, 1500));
        }
      }
      if (responseText) break;
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
