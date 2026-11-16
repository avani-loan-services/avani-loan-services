# FOUR-PROJECT ARCHITECTURE AUDIT (2026-11-16)

| Project | Folder & Repo | Runtime & Framework | Responsibility Preserved |
|---|---|---|---|
| **Project 1** | `1-AVANI LOAN SERVICE FY 26-27` (`avani-loan-services/avani-loan-services`, `master`) | React 19 + Vite 6 + Express 5 (`src/server.cjs`) + Vercel | Central portal, public website (`www.avanifinserv.com`), Builder & Education CRMs, Integration Gateway & `/admin/integrations` |
| **Project 2** | `3-AVANI AI CRM` (`avaniagrofoods/avani-ai-crm`, `main`) | Next.js `16.2.10` + Mongoose `9.7.3` + `pg` + `backend/` | Omnichannel CRM leads, WhatsApp inbox, Meta/ChatMitra campaigns & follow-ups |
| **Project 3** | `4-AVANI LOAN AGENTS` (`avaniagrofoods/avani-loan-agents`, `main`) | Next.js + Prisma + `lib/agents/advisor-prompt.ts` + `lib/services/crmSync.ts` | 8-category loan advisory, eligibility tools, and regulated agent escalation |
| **Project 4** | `5-AVAVI AI CALLING AGENT` (`avaniagrofoods/avani-calling-agent`, `main`) | Node.js (`calling-agent-bridge.js`) | Trilingual (EN/MR/HI) AI disclosure voice bridge, PII scrubbing & disposition mapping |
