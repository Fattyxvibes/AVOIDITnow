import { AIChatBox, type Message } from "@/components/AIChatBox";
import { PublicPage } from "@/components/PublicPage";
import { getIslamicReferenceAppendix } from "@/lib/islamicReferences";
import { useState } from "react";
import { ViewportReveal } from "@/components/ViewportReveal";

function extractText(payload: unknown) {
  if (!payload || typeof payload !== "object") return "";
  const choice = (payload as { choices?: Array<{ delta?: { content?: unknown } }> }).choices?.[0];
  return typeof choice?.delta?.content === "string" ? choice.delta.content : "";
}

export default function Assistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const send = async (content: string) => {
    if (isLoading) return;
    const next = [...messages, { role: "user" as const, content }];
    const referenceAppendix = getIslamicReferenceAppendix(content);
    setMessages([...next, { role: "assistant", content: "" }]);
    setIsLoading(true);
    try {
      const response = await fetch("/api/assistant/stream", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: next }) });
      if (!response.ok || !response.body) throw new Error("Assistant unavailable");
      const reader = response.body.getReader(); const decoder = new TextDecoder(); let buffer = "";
      while (true) { const { done, value } = await reader.read(); if (done) break; buffer += decoder.decode(value, { stream: true }); const events = buffer.split("\n\n"); buffer = events.pop() ?? ""; for (const event of events) { for (const line of event.split("\n")) { if (!line.startsWith("data: ")) continue; const body = line.slice(6); if (body === "[DONE]") continue; try { const text = extractText(JSON.parse(body)); if (text) setMessages(current => [...current.slice(0, -1), { role: "assistant", content: `${current[current.length - 1]?.content ?? ""}${text}` }]); } catch { /* wait for a complete SSE packet */ } } } }
      if (referenceAppendix) setMessages(current => [...current.slice(0, -1), { role: "assistant", content: `${current[current.length - 1]?.content ?? ""}${referenceAppendix}` }]);
    } catch { setMessages(current => [...current.slice(0, -1), { role: "assistant", content: "I’m having trouble reaching the guide right now. Please try again shortly." }]); }
    finally { setIsLoading(false); }
  };
  return <PublicPage eyebrow="Islamic guidance" title="Ask a thoughtful Islamic question" summary="A source-conscious educational guide for everyday questions about halal, haram, worship, and Islamic ethics. It does not issue fatwas or replace a qualified scholar."><div className="grid gap-7 lg:grid-cols-[.65fr_1.35fr]"><ViewportReveal delay={90}><aside className="rounded-2xl border border-black/10 border-l-4 border-l-[#ce2d32] bg-emerald-950 p-6 text-white"><p className="text-xs font-semibold uppercase tracking-[.16em] text-emerald-200">Study and reflection</p><h2 className="mt-3 font-display text-2xl font-semibold">General guidance, not a ruling</h2><p className="mt-4 text-sm leading-6 text-emerald-50/70">When it can identify a reliable reference, the guide links to primary-text resources. Selected general topics also receive a deterministic Qur'an study link; this is never a personal ruling.</p><div className="mt-7 space-y-3 border-y border-white/10 py-5 text-sm leading-6 text-emerald-50/80"><a href="https://quran.com/en" target="_blank" rel="noreferrer" className="block underline decoration-emerald-300/60 underline-offset-4 hover:text-emerald-200">Study Qur'an passages on Quran.com ↗</a><a href="https://sunnah.com/" target="_blank" rel="noreferrer" className="block underline decoration-emerald-300/60 underline-offset-4 hover:text-emerald-200">Search hadith collections on Sunnah.com ↗</a></div><p className="mt-5 text-xs leading-5 text-emerald-50/55">For personal, legal, financial, marriage, medical, or other high-stakes matters, consult a qualified and trusted scholar or local imam.</p></aside></ViewportReveal><ViewportReveal variant="scale" delay={190}><AIChatBox messages={messages} onSendMessage={send} isLoading={isLoading} height="600px" className="border border-black/10 bg-white shadow-[0_24px_80px_rgba(10,46,28,.10)]" emptyStateMessage="Ask about general Islamic principles, study references, or how scholars approach a question." suggestedPrompts={["What general principles can help me assess if an ingredient is halal?", "How does the Qur'an discuss charity and helping others?", "What should I do when scholars differ on an everyday question?"]} /></ViewportReveal></div></PublicPage>;
}
