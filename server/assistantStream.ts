import type { Request, Response } from "express";
import { randomUUID } from "node:crypto";
import { invokeLLMStream, type Message } from "./_core/llm";
import * as db from "./db";
import { createPublicClientKey, PUBLIC_REQUEST_POLICIES } from "./requestControls";

export const ISLAMIC_GUIDANCE_SYSTEM_PROMPT = `You are the Avoid It Islamic Guidance assistant. Provide respectful, general educational information about Islamic ethics, everyday halal/haram questions, Qur'an and hadith study, and the diversity of scholarly approaches.

This is not a fatwa service. Do not present a conclusive personal religious ruling, claim scholarly consensus without a reliable basis, or replace a qualified and trusted scholar or local imam. For personal, legal, financial, marriage, medical, inheritance, divorce, safety, or other high-stakes questions, explain the general principle and encourage the user to consult an appropriately qualified scholar.

Answer in three short sections when useful: “General guidance”, “References”, and “Where scholars may differ”. Only cite a Qur'an verse or hadith when you are confident of the exact reference. When you cite a Qur'an passage, link to the relevant Quran.com page; when you cite a hadith, link to its exact Sunnah.com page if known. Never fabricate citations, translations, hadith gradings, or links. If you cannot verify a reference, say so plainly and offer a way to check it. Be concise, compassionate, nonjudgmental, and avoid sectarian language.`;

export function sanitizeMessages(value: unknown): Message[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is { role: "user" | "assistant"; content: string } =>
      Boolean(item) && typeof item === "object" &&
      (item as { role?: string }).role !== "system" &&
      ((item as { role?: string }).role === "user" || (item as { role?: string }).role === "assistant") &&
      typeof (item as { content?: unknown }).content === "string"
    )
    .slice(-12)
    .map(item => ({ role: item.role, content: item.content.trim().slice(0, 4000) }))
    .filter(item => item.content.length > 0);
}

export async function streamAssistantResponse(req: Request, res: Response) {
  const messages = sanitizeMessages(req.body?.messages);
  if (!messages.length || messages[messages.length - 1]?.role !== "user") {
    return res.status(400).json({ error: "Please include a user question." });
  }

  const clientKey = createPublicClientKey(req);
  const leaseToken = randomUUID();
  try {
    const acquired = await db.acquireAssistantStreamLease({
      clientKey,
      leaseToken,
      leaseMs: PUBLIC_REQUEST_POLICIES.assistantStreamLeaseMs,
    });
    if (!acquired) {
      res.setHeader("Retry-After", String(Math.ceil(PUBLIC_REQUEST_POLICIES.assistantStreamLeaseMs / 1_000)));
      return res.status(429).json({ error: "A guidance response is already in progress. Please wait for it to finish." });
    }
  } catch (error) {
    console.error("[assistant] shared stream lease could not be acquired", error);
    return res.status(503).json({ error: "The guide is temporarily unavailable. Please try again." });
  }

  let finished = false;
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  try {
    const upstream = await invokeLLMStream({
      messages: [{ role: "system", content: ISLAMIC_GUIDANCE_SYSTEM_PROMPT }, ...messages],
      maxTokens: 700,
    });
    if (!upstream.body) throw new Error("The assistant response did not include a readable stream.");

    res.status(200);
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    reader = upstream.body.getReader();
    const decoder = new TextDecoder();
    res.on("close", () => {
      if (!finished) void reader?.cancel();
    });

    while (!finished) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(decoder.decode(value, { stream: true }));
    }
    const tail = decoder.decode();
    if (tail) res.write(tail);
    finished = true;
    res.end();
  } catch (error) {
    finished = true;
    if (reader) await reader.cancel().catch(() => undefined);
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ error: "The guide could not complete that response. Please try again." })}\n\n`);
      res.end();
    } else {
      res.status(502).json({ error: "The guide is temporarily unavailable. Please try again." });
    }
    console.error("[assistant] streaming request failed", error);
  } finally {
    await db.releaseAssistantStreamLease({ clientKey, leaseToken }).catch(error => {
      console.error("[assistant] shared stream lease could not be released", error);
    });
  }
}
