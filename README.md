# AI Interview System — corrected real-time version

## What is included
- Admin / HR login with seeded demo admin account.
- Candidate invitation and first-time password setup.
- Admin job creation with required skills and minimum experience.
- Five configurable assessment stages:
  1. Technical MCQ
  2. Technical Coding
  3. Communication
  4. Behavioral
  5. Scenario-based
- Per-stage question counts and pass criteria.
- Candidate-selected coding language: Python, Java, C, C++, JavaScript.
- Camera verification before the assessment and live face-presence monitoring during it.
- Testing mode allows tab switching and copy/paste. Set `VITE_SECURE_MODE=true` for deployment; secure mode logs tab-switch events.
- AI question generation, answer evaluation and report summarization through Gemini when `GEMINI_API_KEY` is configured. A local fallback keeps the demo usable without an API key.
- HR reports show overall score, stage scores, integrity and verification status. HR selection remains a human action.

## Admin login
Email: `admin@aiinterview.com`
Password: `Admin@12345`

Change these credentials before any real deployment.

## Run backend
```powershell
cd backend
npm install
npm start
```
The server runs on `http://localhost:5000`.

The backend initializes/updates the PostgreSQL schema automatically from `database.sql` and seeds the admin account.

## Run frontend
```powershell
cd frontend
npm install
npm run dev
```
Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

## Gemini
Put your Gemini API key in `backend/.env`:
```env
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.5-flash
```

## Important
After changing any backend route, AI module, database schema or server code:
1. Stop the running Node server with Ctrl+C.
2. Start it again with `npm start`.
3. Then test the changed API.

The local coding runner executes code on the backend machine and is intended for controlled development/testing. Production should use an isolated sandbox service.
