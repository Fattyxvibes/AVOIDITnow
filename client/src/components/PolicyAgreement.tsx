import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { hasAcceptedPolicyAgreement, savePolicyAgreement } from "@/lib/policyAgreement";
import { FileCheck2, ShieldCheck } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { Link } from "wouter";

function getBrowserStorage() {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function usePolicyAgreement() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(() => {
    const storage = getBrowserStorage();
    return storage ? hasAcceptedPolicyAgreement(storage) : false;
  });
  const continuationRef = useRef<(() => void) | null>(null);

  const requestPolicyAgreement = useCallback((onAccepted: () => void) => {
    if (hasAccepted) {
      onAccepted();
      return;
    }

    continuationRef.current = onAccepted;
    setIsOpen(true);
  }, [hasAccepted]);

  const closeAgreement = useCallback(() => {
    continuationRef.current = null;
    setIsOpen(false);
  }, []);

  const acceptAgreement = useCallback(() => {
    const storage = getBrowserStorage();
    if (storage) savePolicyAgreement(storage);
    setHasAccepted(true);
    setIsOpen(false);
    const continueSearch = continuationRef.current;
    continuationRef.current = null;
    continueSearch?.();
  }, []);

  const agreementDialog = (
    <Dialog open={isOpen} onOpenChange={open => open ? setIsOpen(true) : closeAgreement()}>
      <DialogContent showCloseButton className="max-w-[calc(100%-2rem)] rounded-2xl border-[#137547]/20 bg-[#fffef9] p-6 shadow-[0_24px_70px_rgba(20,33,23,.22)] sm:max-w-md">
        <DialogHeader className="pr-7 text-left">
          <div className="mb-1 flex size-10 items-center justify-center rounded-xl bg-[#e9f3eb] text-[#137547]"><ShieldCheck className="size-5" aria-hidden="true" /></div>
          <DialogTitle className="font-display text-2xl font-semibold tracking-[-.045em] text-[#172119]">A quick note before your first check</DialogTitle>
          <DialogDescription className="pt-1 text-sm leading-6 text-[#536057]">Please take a moment to review how AVOIDITnow handles information and the terms for using this source-linked product checker.</DialogDescription>
        </DialogHeader>
        <div className="rounded-xl border border-[#137547]/15 bg-[#f3f7f2] p-4 text-sm leading-6 text-[#435046]">
          <p className="flex items-start gap-2"><FileCheck2 className="mt-0.5 size-4 shrink-0 text-[#137547]" aria-hidden="true" /><span>By continuing, you acknowledge that you have had the opportunity to read the <Link href="/privacy" onClick={closeAgreement} className="font-bold text-[#137547] underline decoration-[#137547]/40 underline-offset-2 hover:text-[#0e633b]">Privacy Policy</Link> and <Link href="/terms" onClick={closeAgreement} className="font-bold text-[#137547] underline decoration-[#137547]/40 underline-offset-2 hover:text-[#0e633b]">Terms of Use</Link>.</span></p>
          <p className="mt-3 text-xs leading-5 text-[#667169]">Your acknowledgement is remembered only in this browser so you are not asked again on future visits. You can still browse the website without accepting.</p>
        </div>
        <DialogFooter className="gap-3 sm:justify-end">
          <Button type="button" variant="outline" onClick={closeAgreement} className="border-[#137547]/25 bg-white font-bold text-[#137547] hover:bg-[#e9f3eb] hover:text-[#0e633b]">Not now</Button>
          <Button type="button" onClick={acceptAgreement} className="bg-[#137547] font-bold text-white hover:bg-[#0e633b]">Agree & continue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return { hasAccepted, requestPolicyAgreement, agreementDialog };
}
