// @ts-check

/**
 * CoverLetterEngine — Intelligence module for generating tailored cover letters,
 * recruiter emails, LinkedIn messages, and referral requests.
 */
export class CoverLetterEngine {
  /**
   * Generate a short 2-paragraph cover letter tailored to company and role.
   * @param {object} params
   * @param {string} params.company
   * @param {string} params.role
   * @param {string} [params.candidateName]
   * @param {string} [params.topAchievement]
   * @returns {string}
   */
  generateShortCoverLetter({ company, role, candidateName = 'Candidate', topAchievement }) {
    const proofPoint = topAchievement || 'architected high-throughput AI agent pipelines with zero-token discovery';

    return `Dear ${company} Hiring Team,

I am writing to express my strong interest in the ${role} position. Having followed ${company}'s momentum in production software engineering, I am excited about the opportunity to contribute directly to your technical roadmap.

In my recent work, I ${proofPoint}. I bring a track record of building resilient systems with Clean Architecture and strict reliability standards. I look forward to discussing how my background aligns with ${company}'s goals.

Best regards,
${candidateName}`;
  }

  /**
   * Generate a formal long 4-paragraph cover letter.
   * @param {object} params
   * @returns {string}
   */
  generateLongCoverLetter(params) {
    const short = this.generateShortCoverLetter(params);
    return `${short}\n\nAdditionally, I specialize in full-stack architecture, automated quality gates, and AI-driven workflow optimization. I welcome the chance to share further details regarding my past impact.`;
  }

  /**
   * Generate a cold recruiter outreach email draft.
   * @param {object} params
   * @returns {string}
   */
  generateRecruiterEmail({ company, role, candidateName = 'Candidate' }) {
    return `Subject: ${role} — ${candidateName}

Hi ${company} Recruiting Team,

I saw the open ${role} position at ${company} and wanted to reach out directly.

My background centers on building production-grade software architectures, resilient background workers, and AI integrations. Given ${company}'s focus, I believe my experience would be a strong fit for the team.

Would you have 10 minutes for a brief chat this week?

Best regards,
${candidateName}`;
  }

  /**
   * Generate a concise LinkedIn connection / outreach message.
   * @param {object} params
   * @returns {string}
   */
  generateLinkedInMessage({ company, role }) {
    return `Hi! I noticed the ${role} role at ${company} and was impressed by the work your engineering team is doing. I've spent the past year building autonomous AI pipelines and would love to connect!`;
  }

  /**
   * Generate a referral request message for warm connections.
   * @param {object} params
   * @returns {string}
   */
  generateReferralRequest({ company, role }) {
    return `Hey! I noticed an open ${role} role at ${company} that aligns closely with my background in software architecture and production AI engineering. If you feel comfortable, would you be open to submitting a referral or introducing me to the hiring manager? Happy to share my CV!`;
  }
}
