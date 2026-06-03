# Arqivo AI

A full-stack AI case-assistant demo that helps users turn messy case notes, emails, requests, and document text into organized summaries, missing-information checks, risk explanations, next-step plans, draft responses, and review-ready reports.

Arqivo AI is designed as a human-in-the-loop workflow assistant. It does not make final decisions automatically and should not be used as a replacement for professional judgment.

---

## Running Locally

After cloning the repository and `cd`'ing into it:

### 1) Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Open your browser and visit:

```txt
http://localhost:3000
```

### 2) Start the FastAPI backend

The FastAPI backend powers the structured agent demo routes.

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

The backend runs at:

```txt
http://localhost:8000
```

### 3) Deploy or update the Cloudflare Worker

The Cloudflare Worker powers the main AI chatbot.

```bash
cd cloudflare-worker
npm install
npx wrangler deploy
```

---

## Environment Variables

For local or Vercel deployment, configure:

```txt
NEXT_PUBLIC_CHAT_API_URL=<your Cloudflare Worker URL>
NEXT_PUBLIC_API_URL=<your FastAPI backend URL>
```

`NEXT_PUBLIC_CHAT_API_URL` is used by the main chatbot.

`NEXT_PUBLIC_API_URL` is used by the FastAPI-backed agent demo.

---

## Safety Notes

Arqivo AI is a public demo.

Users should not enter real private or sensitive information, including real names, addresses, ID numbers, phone numbers, emails, medical information, financial information, confidential documents, or private case details.

The main chat page does not store user-entered case text in an Arqivo AI database. The text is held in browser state and clears on refresh or when the user clicks Clear All.

When a user sends a message, the case text is sent to Cloudflare Workers AI for processing. For safety, users should use fake demo text or placeholders.

---

## Highlights

- Public AI chatbot interface for case/document review
- User-editable case text workspace
- Cloudflare Workers AI integration for natural language responses
- Structured multi-agent demo with intake, summary, missing-information, risk, planning, drafting, and quality review agents
- Safety reminders for public demo use
- Clear workspace and sample case controls
- Request limits to reduce unnecessary AI usage
- FastAPI backend for structured agent analysis
- Vercel frontend deployment
- Cloudflare Worker deployment for the main chat endpoint
- Hugging Face Spaces backend deployment for the agent demo

---

## Tech Stack

Frontend: Next.js, TypeScript, Tailwind CSS

AI Chat: Cloudflare Workers AI

Chat API Layer: Cloudflare Workers

Backend Demo API: FastAPI, Python

Hosting: Vercel, Cloudflare Workers, Hugging Face Spaces

---

## Architecture

```txt
Main Chat Page
Client -> Vercel Frontend -> Cloudflare Worker -> Cloudflare Workers AI
```

```txt
Agent Demo Page
Client -> Vercel Frontend -> FastAPI Backend -> Structured Agent Pipeline
```

```txt
Structured Agent Pipeline
Input Text
-> Intake Agent
-> Summary Agent
-> Missing Information Agent
-> Risk Agent
-> Planner Agent
-> Message Drafting Agent
-> Quality Review / Audit-style Output
```

---

## Example Use Cases

Arqivo AI can help with prompts like:

- Summarize this case
- What information is missing?
- What is the risk level?
- What should the worker do next?
- Draft a response
- Generate a final report

---

## Project Structure

```txt
arqivo-ai/
├── backend/
│   ├── agents.py
│   ├── chat_agent.py
│   ├── main.py
│   ├── requirements.txt
│   └── sample_data.py
│
├── cloudflare-worker/
│   ├── src/
│   │   └── index.ts
│   ├── package.json
│   ├── package-lock.json
│   └── wrangler.toml
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── demo/
│   │   ├── about/
│   │   ├── agents/
│   │   ├── architecture/
│   │   ├── review-queue/
│   │   └── components/
│   ├── package.json
│   └── package-lock.json
│
└── README.md
```

---

## Disclaimer

Arqivo AI is a demo project. It should not be used as legal advice, medical advice, financial advice, government decision-making, or official case review.

A human should always review the output before taking action.