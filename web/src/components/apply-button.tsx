"use client";

import { useRouter } from "next/navigation";
import { Send, Lock } from "lucide-react";
import { useJobs } from "@/components/jobs/job-store";
import { useApply } from "@/components/apply/apply-provider";
import { cn } from "@/lib/cn";

// The "Apply" CTA — brand orange, paper-plane.
// Enabled whenever the report has a valid application URL.
// On click it opens the apply form-proxy for the offer (where the user reviews
// and submits it themselves — never auto-submit).
export function ApplyButton({ n, url, company, pdfReady }: { n: string; url?: string; company: string; pdfReady: boolean }) {
  const router = useRouter();
  const { jobs } = useJobs();
  const apply = useApply();

  const pdfJobDone = jobs.some((j) => j.kind === "pdf" && j.input === n && j.status === "done");
  const hasUrl = !!url && /^https?:\/\//i.test(url);
  const hasPdf = pdfReady || pdfJobDone;

  if (!hasUrl) {
    return (
      <button
        type="button"
        disabled
        title="No application URL on this report"
        className="inline-flex cursor-not-allowed items-center justify-center gap-1.5 rounded-full border border-border bg-surface/40 px-3.5 py-1 text-xs font-medium text-faint max-sm:min-h-[44px]"
      >
        <Lock className="size-3.5" /> Apply
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        apply.open(url!, { prefill: true, company });
        router.push("/apply");
      }}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-medium shadow-sm transition-colors max-sm:min-h-[44px]",
        hasPdf
          ? "bg-brand text-brand-foreground hover:bg-brand-200"
          : "border border-brand/50 bg-brand-soft text-brand hover:bg-brand/20"
      )}
      title={hasPdf ? "Apply — opens form pre-filled with tailored CV" : "Apply — opens form pre-filled from your CV"}
    >
      <Send className="size-3.5" /> Apply
    </button>
  );
}
