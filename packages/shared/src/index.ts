// @ts-check
/**
 * @career-ops/shared — Shared DTOs and Type Definitions
 */

export interface CandidateProfile {
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  target_roles?: string[];
  pdfPath?: string;
}

export interface DiscoveredJob {
  id: string;
  title: string;
  company: string;
  applyUrl: string;
  location?: string;
  matchScore?: number;
  simhash?: string;
  postedAt?: string;
}

export type ApplicationMode = 'manual' | 'assisted' | 'autonomous';

export type ApplicationStatus =
  | 'DISCOVERED'
  | 'EVALUATED'
  | 'READY_TO_APPLY'
  | 'APPLIED'
  | 'INTERVIEW'
  | 'OFFER'
  | 'REJECTED'
  | 'PAUSED_HITL';

export interface ApplicationRecord {
  id: string;
  jobId: string;
  company: string;
  role: string;
  applyUrl: string;
  score: number;
  status: ApplicationStatus;
  mode: ApplicationMode;
  sessionFile?: string;
  screenshotPath?: string;
  createdAt: string;
}
