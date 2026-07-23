import { NextRequest } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { careerOpsRoot } from "@/lib/career-ops";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Serve the tailored CV PDF the pdf mode wrote to output/cv-…-{company}-…pdf for
// a given offer (matched by company slug, newest first). Inline so it opens in
// the browser. Local-first: reads the user's own output/ dir.
export async function GET(req: NextRequest) {
  const company = (req.nextUrl.searchParams.get("company") ?? "").trim();
  const slug = (company.toLowerCase().match(/[a-z0-9]+/g) ?? []).join("-");
  const dir = path.join(careerOpsRoot(), "output");
  let files: string[] = [];
  try {
    const allPdfs = fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith(".pdf"));
    if (slug) {
      const re = new RegExp(`(^|[^a-z0-9])${slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z0-9]|$)`, "i");
      files = allPdfs.filter((f) => re.test(f.toLowerCase()));
    }
    if (!files.length) {
      files = allPdfs;
    }
  } catch {
    return new Response("no output directory", { status: 404 });
  }
  if (!files.length) return new Response("no tailored CV found in output directory", { status: 404 });

  files.sort((a, b) => fs.statSync(path.join(dir, b)).mtimeMs - fs.statSync(path.join(dir, a)).mtimeMs);
  const file = path.join(dir, files[0]);
  try {
    const buf = fs.readFileSync(file);
    return new Response(new Uint8Array(buf), {
      status: 200,
      headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="${files[0]}"`, "Cache-Control": "no-store" },
    });
  } catch {
    return new Response("could not read the PDF", { status: 500 });
  }
}
