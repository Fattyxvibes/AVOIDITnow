import { PublicPage } from "@/components/PublicPage";
import { ViewportReveal } from "@/components/ViewportReveal";
import { Button } from "@/components/ui/button";
import { FileText, Scale } from "lucide-react";
import { Link } from "wouter";
import privacyPolicyDraft from "../../../legal-drafts/AVOIDITnow_Privacy_Policy_Published.md?raw";
import termsOfUseDraft from "../../../legal-drafts/AVOIDITnow_Terms_of_Use_Published.md?raw";

function removeDocumentTitle(draft: string) {
  return draft.replace(/^# [^\n]+\n\n/, "");
}

function splitTableRow(line: string) {
  return line.trim().replace(/^\||\|$/g, "").split("|").map(cell => cell.trim());
}

function isTableDivider(line: string) {
  return /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(line.trim());
}

function isBlockStart(line: string) {
  return line.startsWith("## ") || line.startsWith("### ") || line.startsWith("> ") || line.startsWith("|") || /^\d+\.\s/.test(line) || /^[-*]\s/.test(line);
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\(https?:\/\/[^)]+\))/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`")) return <code key={index} className="rounded bg-[#edf3eb] px-1.5 py-0.5 text-[.88em] text-[#172119]">{part.slice(1, -1)}</code>;

    const linkMatch = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)(?:\s+"[^"]*")?\)$/);
    if (linkMatch) return <a key={index} href={linkMatch[2]} target="_blank" rel="noreferrer">{linkMatch[1]}</a>;

    return part;
  });
}

function PolicyDocument({ draft }: { draft: string }) {
  const lines = removeDocumentTitle(draft).trim().split("\n");
  const blocks: React.ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();
    if (!line) {
      index += 1;
      continue;
    }

    if (line.startsWith("## ")) {
      blocks.push(<h2 key={`heading-${index}`} className="mt-11 font-display text-2xl font-semibold tracking-[-.04em] text-[#172119] sm:text-3xl">{renderInline(line.slice(3))}</h2>);
      index += 1;
      continue;
    }

    if (line.startsWith("### ")) {
      blocks.push(<h3 key={`subheading-${index}`} className="mt-8 text-lg font-bold text-[#172119]">{renderInline(line.slice(4))}</h3>);
      index += 1;
      continue;
    }

    if (line.startsWith("> ")) {
      blocks.push(<blockquote key={`notice-${index}`} className="my-6 border-l-4 border-[#137547]/40 bg-[#f1f7f1] px-5 py-4 text-sm leading-6 text-[#435046]">{renderInline(line.slice(2))}</blockquote>);
      index += 1;
      continue;
    }

    if (line.startsWith("|") && isTableDivider(lines[index + 1] ?? "")) {
      const headings = splitTableRow(line);
      index += 2;
      const rows: string[][] = [];
      while (index < lines.length && lines[index].trim().startsWith("|")) {
        rows.push(splitTableRow(lines[index]));
        index += 1;
      }

      blocks.push(<div key={`table-${index}`} className="my-7 overflow-x-auto rounded-xl border border-black/10"><table className="min-w-full border-collapse text-left text-sm"><thead className="bg-[#edf4ec] text-[#172119]"><tr>{headings.map((heading, columnIndex) => <th key={columnIndex} className="border-b border-black/10 px-4 py-3 font-bold">{renderInline(heading)}</th>)}</tr></thead><tbody className="bg-white text-[#172119]">{rows.map((row, rowIndex) => <tr key={rowIndex} className="align-top even:bg-[#fbfcfa]">{headings.map((_, columnIndex) => <td key={columnIndex} className="border-b border-black/8 px-4 py-3 leading-6 last:border-b-0">{renderInline(row[columnIndex] ?? "")}</td>)}</tr>)}</tbody></table></div>);
      continue;
    }

    if (/^\d+\.\s/.test(line) || /^[-*]\s/.test(line)) {
      const ordered = /^\d+\.\s/.test(line);
      const items: string[] = [];
      while (index < lines.length) {
        const listLine = lines[index].trim();
        const matchesListType = ordered ? /^\d+\.\s/.test(listLine) : /^[-*]\s/.test(listLine);
        if (!matchesListType) break;
        items.push(listLine.replace(ordered ? /^\d+\.\s/ : /^[-*]\s/, ""));
        index += 1;
      }
      const List = ordered ? "ol" : "ul";
      blocks.push(<List key={`list-${index}`} className={`my-5 space-y-2 pl-6 text-sm leading-7 text-[#172119] ${ordered ? "list-decimal" : "list-disc"}`}>{items.map((item, itemIndex) => <li key={itemIndex}>{renderInline(item)}</li>)}</List>);
      continue;
    }

    const paragraph: string[] = [line];
    index += 1;
    while (index < lines.length && lines[index].trim() && !isBlockStart(lines[index].trim())) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    blocks.push(<p key={`paragraph-${index}`} className="my-4 text-sm leading-7 text-[#172119]">{renderInline(paragraph.join(" "))}</p>);
  }

  return <>{blocks}</>;
}

function LegalPolicyPage({ title, summary, draft, alternateHref, alternateLabel, icon }: { title: string; summary: string; draft: string; alternateHref: string; alternateLabel: string; icon: React.ReactNode }) {
  return (
    <PublicPage eyebrow="Legal information" title={title} summary={summary}>
      <ViewportReveal delay={100}>
        <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-[#137547]/15 bg-[#f2f6f1] px-5 py-4 sm:items-center">
          <div className="flex items-center gap-3 text-sm text-[#435046]">{icon}<span>Read the related policy before continuing to use the Services.</span></div>
          <Link href={alternateHref} className="w-full sm:w-auto"><Button variant="outline" className="min-h-11 w-full border-[#137547]/25 bg-white font-bold text-[#137547] hover:bg-[#e9f3eb] hover:text-[#0e633b] sm:w-auto">{alternateLabel}</Button></Link>
        </div>
      </ViewportReveal>
      <article className="mt-8 rounded-2xl border border-black/10 bg-white p-6 text-[#172119] shadow-[0_10px_30px_rgba(20,33,23,.045)] sm:p-9">
        <PolicyDocument draft={draft} />
      </article>
    </PublicPage>
  );
}

export function PrivacyPolicy() {
  return <LegalPolicyPage title="Privacy Policy" summary="How AVOIDITnow handles the limited information needed to run the public platform." draft={privacyPolicyDraft} alternateHref="/terms" alternateLabel="Read Terms of Use" icon={<FileText className="size-5 shrink-0 text-[#137547]" aria-hidden="true" />} />;
}

export function TermsOfUse() {
  return <LegalPolicyPage title="Terms of Use" summary="The conditions, limitations, and responsibilities that apply when you use AVOIDITnow." draft={termsOfUseDraft} alternateHref="/privacy" alternateLabel="Read Privacy Policy" icon={<Scale className="size-5 shrink-0 text-[#137547]" aria-hidden="true" />} />;
}
