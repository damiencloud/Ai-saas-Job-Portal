import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { careerOpsRoot } from "@/lib/career-ops";

// GET /api/autonomous — Returns active mode, pending sessions, daily quota stats
export async function GET() {
  const root = careerOpsRoot();
  const sessionsDir = path.join(root, "data", "sessions");
  
  let mode = process.env.CAREER_OPS_MODE || "manual";
  let minScore = process.env.CAREER_OPS_MIN_SCORE ? parseFloat(process.env.CAREER_OPS_MIN_SCORE) : 4.5;
  let maxDaily = process.env.CAREER_OPS_MAX_DAILY ? parseInt(process.env.CAREER_OPS_MAX_DAILY, 10) : 10;

  // List pending paused sessions (CAPTCHA / 2FA / Assisted)
  const pendingSessions: any[] = [];
  if (fs.existsSync(sessionsDir)) {
    const files = fs.readdirSync(sessionsDir).filter((f) => f.endsWith(".json"));
    for (const f of files) {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(sessionsDir, f), "utf8"));
        pendingSessions.push(data);
      } catch {}
    }
  }

  return NextResponse.json({
    mode,
    minScore,
    maxDaily,
    pendingSessions,
    status: "active",
  });
}

// POST /api/autonomous — Triggers an autonomous application run for a specific report/job
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { reportNo, applyUrl, company, role, score, mode } = body;

    if (!applyUrl || !company || !role) {
      return NextResponse.json({ error: "applyUrl, company, and role are required" }, { status: 400 });
    }

    // Dynamic import of AutonomousRunner using static relative specifiers
    // @ts-ignore
    const { AutonomousRunner } = await import("../../../../../lib/engine/AutonomousRunner.mjs");
    // @ts-ignore
    const { ApplicationModeConfig } = await import("../../../../../lib/domain/ApplicationMode.mjs");

    const modeConfig = new ApplicationModeConfig({ mode: mode || "autonomous", minScoreThreshold: score || 4.5 });
    const runner = new AutonomousRunner({ modeConfig, providersDir: path.join(root, "providers") });

    // Dummy sample profile (reads from config/profile.yml if available)
    const profile = { first_name: "Candidate", email: "candidate@example.com" };

    const result = await runner.runApplication(
      { company, role, applyUrl, score: score || 4.5, reportNo },
      profile
    );

    return NextResponse.json({ ok: true, result });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Execution failed" }, { status: 500 });
  }
}
