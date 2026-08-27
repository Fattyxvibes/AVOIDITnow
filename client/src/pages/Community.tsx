import { useAuth } from "@/_core/hooks/useAuth";
import { PublicPage, QueryState } from "@/components/PublicPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { MessageCircle, ThumbsUp } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { Link, useRoute } from "wouter";

export function Community() {
  const { user, loading } = useAuth();
  const utils = trpc.useUtils();
  const result = trpc.platform.community.listQuestions.useQuery();
  const submit = trpc.platform.community.submitQuestion.useMutation({
    onSuccess: () => { toast.success("Your question has been submitted for review."); utils.platform.community.listQuestions.invalidate(); },
    onError: error => toast.error(error.message),
  });
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Products");
  const [body, setBody] = useState("");
  const onSubmit = (event: FormEvent) => { event.preventDefault(); if (!user) return startLogin(); submit.mutate({ title, category, body }); };
  return <PublicPage eyebrow="Community intelligence" title="Ask, compare, contribute" summary="Bring specific questions to the community. New posts are reviewed before publication, and helpful answers receive support through real member votes.">
    <div className="grid gap-8 lg:grid-cols-[.9fr_1.1fr]"><section className="rounded-2xl border border-emerald-300/15 bg-emerald-300/[.06] p-6 sm:p-7"><p className="text-xs font-semibold uppercase tracking-[.16em] text-emerald-200">Start a discussion</p><h2 className="mt-4 text-2xl font-semibold text-white">What would you like to verify?</h2><form onSubmit={onSubmit} className="mt-6 space-y-3"><Input value={title} onChange={event => setTitle(event.target.value)} minLength={8} maxLength={240} required placeholder="A clear, specific question" className="h-11 border-white/10 bg-black/15 text-white placeholder:text-emerald-50/35" /><Input value={category} onChange={event => setCategory(event.target.value)} minLength={2} maxLength={80} required placeholder="Category" className="h-11 border-white/10 bg-black/15 text-white placeholder:text-emerald-50/35" /><Textarea value={body} onChange={event => setBody(event.target.value)} minLength={20} maxLength={5000} required placeholder="Add the product, claim, source, or decision context that will help others respond." className="min-h-32 border-white/10 bg-black/15 text-white placeholder:text-emerald-50/35" /><Button type="submit" disabled={loading || submit.isPending} className="w-full bg-emerald-300 font-semibold text-emerald-950 hover:bg-emerald-200">{user ? "Submit for review" : "Sign in to submit"}</Button></form><p className="mt-4 text-xs leading-5 text-emerald-50/50">Questions are not publicly visible until moderation is complete.</p></section><section><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[.16em] text-emerald-300">Published conversations</p><h2 className="mt-3 text-2xl font-semibold text-white">Recent questions</h2></div><MessageCircle className="size-6 text-emerald-300" /></div><QueryState loading={result.isLoading} error={result.error} empty={!result.data?.length} emptyTitle="No published questions yet" emptyDescription="The board will populate after its first submitted questions have completed moderation."><div className="mt-6 space-y-3">{result.data?.map(question => <Link key={question.id} href={`/community/${question.id}`} className="block rounded-2xl border border-white/10 bg-white/[.035] p-5 transition hover:border-emerald-300/25"><div className="flex items-center justify-between gap-4"><span className="text-xs font-semibold uppercase tracking-[.14em] text-emerald-300">{question.category}</span><span className="text-xs text-emerald-50/40">{new Date(question.createdAt).toLocaleDateString()}</span></div><h3 className="mt-3 text-lg font-semibold text-white">{question.title}</h3><p className="mt-2 line-clamp-2 text-sm leading-6 text-emerald-50/60">{question.body}</p></Link>)}</div></QueryState></section></div>
  </PublicPage>;
}

export function CommunityDetail() {
  const [, params] = useRoute("/community/:questionId");
  const questionId = Number(params?.questionId);
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const question = trpc.platform.community.detail.useQuery({ questionId }, { enabled: Number.isFinite(questionId) });
  const answers = trpc.platform.community.listAnswers.useQuery({ questionId }, { enabled: Number.isFinite(questionId) });
  const postAnswer = trpc.platform.community.submitAnswer.useMutation({ onSuccess: () => { toast.success("Your answer is now live."); utils.platform.community.listAnswers.invalidate({ questionId }); }, onError: error => toast.error(error.message) });
  const toggleVote = trpc.platform.community.toggleAnswerVote.useMutation({ onSuccess: () => utils.platform.community.listAnswers.invalidate({ questionId }), onError: error => toast.error(error.message) });
  const [body, setBody] = useState("");
  return <PublicPage eyebrow="Community conversation" title={question.data?.title ?? "Community question"} summary={question.data?.body ?? "Loading the published discussion."}><Link href="/community" className="text-sm font-semibold text-emerald-200 hover:text-emerald-100">← Back to community</Link><QueryState loading={question.isLoading} error={question.error} empty={!question.data} emptyTitle="This conversation is unavailable" emptyDescription="It may not have been published or may have been removed during moderation.">{question.data && <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_.9fr]"><section><p className="text-xs font-semibold uppercase tracking-[.16em] text-emerald-300">{question.data.category}</p><h2 className="mt-4 text-2xl font-semibold text-white">Answers</h2><QueryState loading={answers.isLoading} error={answers.error} empty={!answers.data?.length} emptyTitle="No answers yet" emptyDescription="Share a sourced perspective to help the next person make an informed choice."><div className="mt-5 space-y-4">{answers.data?.map(answer => <article key={answer.id} className="rounded-2xl border border-white/10 bg-white/[.035] p-5"><p className="text-sm leading-7 text-emerald-50/75">{answer.body}</p><div className="mt-4 flex items-center justify-between"><span className="text-xs text-emerald-50/40">{new Date(answer.createdAt).toLocaleDateString()}</span><Button variant="ghost" size="sm" onClick={() => user ? toggleVote.mutate({ answerId: answer.id }) : startLogin()} className="gap-2 text-emerald-200 hover:bg-white/8 hover:text-white"><ThumbsUp className="size-4" />{answer.votes}</Button></div></article>)}</div></QueryState></section><aside className="rounded-2xl border border-emerald-300/15 bg-emerald-300/[.06] p-6"><p className="text-xs font-semibold uppercase tracking-[.16em] text-emerald-200">Add an answer</p><p className="mt-3 text-sm leading-6 text-emerald-50/60">Use your own experience, share a source when possible, and distinguish facts from your interpretation.</p><Textarea value={body} onChange={event => setBody(event.target.value)} minLength={12} maxLength={5000} placeholder="Write a helpful response" className="mt-5 min-h-36 border-white/10 bg-black/15 text-white placeholder:text-emerald-50/35" /><Button onClick={() => user ? postAnswer.mutate({ questionId, body }) : startLogin()} disabled={postAnswer.isPending || body.length < 12} className="mt-3 w-full bg-emerald-300 font-semibold text-emerald-950 hover:bg-emerald-200">{user ? "Post answer" : "Sign in to answer"}</Button></aside></div>}</QueryState></PublicPage>;
}
