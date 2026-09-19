# AI Interview & Assessment System

Real-time full-stack implementation with PostgreSQL, React, adaptive interview flow, coding execution, communication assessment, continuous webcam monitoring and HR reporting.

## Setup
1. Copy `.env.example` to `.env` and set PostgreSQL credentials.
2. Run `npm install`.
3. Run `node server.js`. The server creates/updates the application tables automatically.
4. Frontend: `npm install`, then `npm run dev`.

Admin login: `admin@aiinterview.com` / `Admin@12345`

Gemini is optional. Add `GEMINI_API_KEY` for generated questions/evaluation. Without a key the system uses its production-safe local question bank and deterministic scoring fallback, so the demo remains runnable.

Coding execution uses local child-process sandboxes with strict timeouts and language allow-list. For public deployment, replace this runner with a container-isolated execution service.
