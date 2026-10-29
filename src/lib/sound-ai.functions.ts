import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const ProfileSchema = z.object({
  growl: z.number().describe("Distortion/aggression 0.1-1"),
  filterBase: z.number().describe("Idle brightness lowpass Hz, 200-900"),
  filterTop: z.number().describe("High-rpm brightness lowpass Hz, 1500-8000"),
  exhaustNoise: z.number().describe("Breathy exhaust rasp 0-0.6"),
  popIntensity: z.number().describe("Pops & crackles 0.2-2"),
  subOctave: z.number().describe("Low bass rumble 0-1"),
  lope: z.number().describe("Uneven V4 big-bang pulse character 0-1"),
  summary: z.string().describe("One short sentence describing the tuned sound"),
});

export type AiSoundProfile = z.infer<typeof ProfileSchema>;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, Number.isFinite(v) ? v : a));

export const designDucatiSound = createServerFn({ method: "POST" })
  .inputValidator((input: { description: string }) => ({ description: String(input.description ?? "").slice(0, 500) }))
  .handler(async ({ data }): Promise<{ profile?: AiSoundProfile; error?: string }> => {
    if (!data.description.trim()) return { error: "Describe the sound you want first." };
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) return { error: "AI is not configured." };
    const { createOpenAI } = await import("@ai-sdk/openai");
    const { streamText, Output } = await import("ai");
    const provider = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey,
      headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    });
    try {
      const result = streamText({
        model: provider.responses("openai/gpt-6-astra"),
        instructions:
          "You are a sound engineer tuning a synthesized Ducati Panigale V4 R (998cc 90° V4, twin-pulse firing). Map the rider's description to synth parameters within the given ranges. Keep it recognisably a Ducati V4.",
        messages: [{ role: "user", content: data.description }],
        output: Output.object({ schema: ProfileSchema }),
        providerOptions: {
          openai: {
            store: false,
            forceReasoning: true,
            reasoningEffort: "low",
            reasoningSummary: "auto",
            include: ["reasoning.encrypted_content"],
          },
        },
      });
      const p = (await result.output) as AiSoundProfile;
      return {
        profile: {
          growl: clamp(p.growl, 0.1, 1),
          filterBase: clamp(p.filterBase, 200, 900),
          filterTop: clamp(p.filterTop, 1500, 8000),
          exhaustNoise: clamp(p.exhaustNoise, 0, 0.6),
          popIntensity: clamp(p.popIntensity, 0.2, 2),
          subOctave: clamp(p.subOctave, 0, 1),
          lope: clamp(p.lope, 0, 1),
          summary: p.summary,
        },
      };
    } catch (e) {
      const status = (e as { statusCode?: number }).statusCode;
      console.error("designDucatiSound failed", e);
      if (status === 429) return { error: "Too many requests — try again in a moment." };
      if (status === 402) return { error: "AI credits have run out for this workspace." };
      return { error: "Couldn't design a sound right now. Please try again." };
    }
  });
