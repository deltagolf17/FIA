import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const { firePatterns, evidence, areaOfOrigin, pointOfOrigin, firstMaterialIgnited, ignitionSource, structureType, weatherConditions } = await req.json();

  const prompt = `You are a certified fire investigator assistant trained on NFPA 921 (Guide for Fire and Explosion Investigations). Analyze the following fire scene data and provide a cause classification recommendation.

## Fire Scene Data

**Structure Type:** ${structureType ?? "Unknown"}
**Weather Conditions:** ${weatherConditions ?? "Unknown"}

**Area of Origin:** ${areaOfOrigin ?? "Not determined"}
**Point of Origin:** ${pointOfOrigin ?? "Not determined"}

**First Material Ignited:** ${firstMaterialIgnited ?? "Unknown"}
**Ignition Source:** ${ignitionSource ?? "Unknown"}

**Fire Patterns Documented:**
${firePatterns?.length > 0
  ? firePatterns.map((p: { patternType: string; location: string; description: string; charDepth?: number }, i: number) =>
      `${i + 1}. ${p.patternType.replace(/_/g, " ")} at ${p.location}: ${p.description}${p.charDepth ? ` (char depth: ${p.charDepth}mm)` : ""}`
    ).join("\n")
  : "No patterns documented"}

**Evidence Collected:**
${evidence?.length > 0
  ? evidence.map((e: { itemNumber: string; description: string; location: string }, i: number) =>
      `${i + 1}. ${e.itemNumber}: ${e.description} (from ${e.location})`
    ).join("\n")
  : "No evidence recorded"}

## Task

Based on this data, provide:

1. **Recommended NFPA 921 Cause Classification** — Choose one: NATURAL, ACCIDENTAL, INCENDIARY, or UNDETERMINED, with your confidence level (High/Medium/Low)

2. **Reasoning** — Explain which fire patterns and evidence support this classification, citing specific NFPA 921 sections

3. **Alternative Hypotheses** — List any alternative cause codes considered and why they were eliminated or kept open (per NFPA 921 §17.4)

4. **Investigation Gaps** — Identify any missing data or investigation steps that would strengthen the determination

Keep your response concise and focused on NFPA 921 methodology. Do not speculate beyond the documented evidence.`;

  const TIMEOUT_MS = 30_000;
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), TIMEOUT_MS);

  try {
    const stream = await anthropic.messages.stream(
      {
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
        system: "You are a fire investigation expert assistant trained on NFPA 921 and NFPA 1033 standards. Provide concise, evidence-based analysis.",
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
      JSON.stringify({ error: isTimeout ? "Analysis timed out after 30 seconds." : "AI analysis failed." }),
      { status: isTimeout ? 408 : 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
