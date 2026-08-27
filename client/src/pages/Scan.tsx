import { PublicPage } from "@/components/PublicPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { ScanLine } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function Scan() { const [barcode, setBarcode] = useState(""); const lookup = trpc.platform.directory.scan.useQuery({ barcode: barcode || "000000" }, { enabled: barcode.length >= 6 }); return <PublicPage eyebrow="Quick lookup" title="Check a product code" summary="Enter a barcode to check whether a reviewed product record is available. Camera scanning can be added in a later device-focused release."><div className="max-w-xl rounded-2xl border border-white/10 bg-white/[.035] p-6"><div className="flex gap-2"><Input value={barcode} onChange={event => setBarcode(event.target.value.replace(/\s/g, ""))} placeholder="Enter barcode digits" className="h-12 border-white/10 bg-black/15 text-white placeholder:text-emerald-50/35" /><Button className="h-12 bg-emerald-300 text-emerald-950 hover:bg-emerald-200"><ScanLine className="size-4" /></Button></div>{barcode.length >= 6 && <div className="mt-6 rounded-xl border border-white/10 p-4">{lookup.isLoading ? <p className="text-sm text-emerald-50/60">Looking up this code…</p> : lookup.data ? <><p className="font-semibold text-white">{lookup.data.name}</p><p className="mt-1 text-sm text-emerald-50/60">{lookup.data.description}</p><Link href={`/products/${lookup.data.slug}`} className="mt-3 inline-block text-sm font-semibold text-emerald-200 hover:text-emerald-100">Open product record →</Link></> : <p className="text-sm text-emerald-50/60">No reviewed record matches this code yet.</p>}</div>}</div></PublicPage>; }
