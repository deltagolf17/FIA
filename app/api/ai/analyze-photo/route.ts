import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";
import { checkRateLimit } from "@/lib/rateLimit";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const rateKey = `ai-photo:${session.user.email}`;
  const { allowed, retryAfterMs } = checkRateLimit(rateKey, 20, 60 * 60 * 1000);
  if (!allowed) {
    return new Response(
      JSON.stringify({ error: `Rate limit exceeded. Try again in ${Math.ceil(retryAfterMs / 60000)} minute(s).` }),
      { status: 429, headers: { "Content-Type": "application/json", "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } }
    );
  }

  let body: {
    imageBase64: string;
    mediaType?: string;
    evidenceDescription?: string;
    evidenceLocation?: string;
    caseNumber?: string;
    structureType?: string;
  };

  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400 });
  }

  const { imageBase64, mediaType = "image/jpeg", evidenceDescription, evidenceLocation, caseNumber, structureType } = body;

  if (!imageBase64) {
    return new Response(JSON.stringify({ error: "imageBase64 is required" }), { status: 400 });
  }

  // Strip data URL prefix if present
  const base64Data = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;

  const contextLines = [
    caseNumber ? `Case Number: ${caseNumber}` : null,
    structureType ? `Structure Type: ${structureType.replace(/_/g, " ")}` : null,
    evidenceLocation ? `Photo Location: ${evidenceLocation}` : null,
    evidenceDescription ? `Evidence Description: ${evidenceDescription}` : null,
  ].filter(Boolean).join("\n");

  const prompt = `You are a certified fire investigator assistant trained on NFPA 921 (Guide for Fire and Explosion Investigations) and NFPA 1033 (Standard for Professional Qualifications for Fire Investigator). Analyze this fire scene photograph and provide a structured NFPA 921-compliant assessment.

${contextLines ? `## Investigation Context\n${contextLines}\n` : ""}

## Analysis Requirements

Examine this fire scene photo and provide:

### 1. Fire Pattern Identification (NFPA 921 §6)
Identify any visible fire patterns, including:
- V-patterns or inverted V-patterns (§6.3.1)
- Char depth variations (§6.3.3)
- Heat shadowing (§6.3.5)
- Pour patterns or irregular burn patterns (§6.3.7)
- Smoke/soot deposition lines (§6.3.8)
- Spalling on concrete/masonry (§6.3.9)
- Clean-burn areas (§6.3.10)
- Alligatoring of char (§6.3.4)

### 2. Area/Point of Origin Indicators (NFPA 921 §18)
Note any indicators suggesting fire origin:
- Low burn patterns or floor-level damage
- Convergence of fire patterns
- Protected areas suggesting fire movement direction
- Irregular burn patterns inconsistent with expected fire spread

### 3. Material & Fuel Package Assessment (NFPA 921 §5)
Identify:
- Apparent fuel packages or combustibles
- First material likely ignited
- Fire spread path based on char patterns
- Any accelerant indicator patterns (if visible)

### 4. Scene Documentation Quality
Assess what additional photos or documentation would strengthen the investigation per NFPA 921 §13.3.

### 5. Preliminary Findings
Provide a brief summary of key observations and their significance to the investigation.

Keep findings objective, evidence-based, and cite relevant NFPA 921 sections. Note any limitations due to photo angle, resolution, or scene conditions.`;

  const TIMEOUT_MS = 45_000;
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), TIMEOUT_MS);

  try {
    const stream = await anthropic.messages.stream(
      {
        model: "claude-sonnet-4-6",
        max_tokens: 1500,
        system: "You are a fire investigation expert trained on NFPA 921 and NFPA 1033. Analyze fire scene photos with precision, citing specific NFPA sections. Be concise, objective, and evidence-based.",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
                  data: base64Data,
                },
              },
              {
                type: "text",
                text: prompt,
              },
            ],
          },
        ],
      },
      { signal: abort.signal }
    );

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
              controller.enqueue(new TextEncoder().encode(chunk.delta.text));
            }
          }
        } catch (e) {
          controller.error(e);
        } finally {
          clearTimeout(timer);
          controller.close();
        }
      },
      cancel() {
        abort.abort();
        clearTimeout(timer);
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (e) {
    clearTimeout(timer);
    const isTimeout = abort.signal.aborted;
    return new Response(
      JSON.stringify({ error: isTimeout ? "Analysis timed out after 45 seconds." : "Photo analysis failed." }),
      { status: isTimeout ? 408 : 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
