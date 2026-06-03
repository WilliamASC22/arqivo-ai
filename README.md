# Arqivo AI

Arqivo AI is a public case-assistant and multi-agent workflow demo. It helps users turn messy case notes, emails, requests, and document text into organized summaries, missing-information checks, risk explanations, next-step plans, draft responses, and review-ready reports.

## Project Goal

The goal of Arqivo AI is to show how AI-assisted workflows can support real-world operations while keeping humans in control of final decisions.

Arqivo AI does not make final decisions automatically. It is meant to help users review information faster, organize messy text, identify possible gaps, and prepare clearer next steps.

## Current Features

- Public chatbot interface
- User-editable case/document text box
- Cloudflare Workers AI chat responses
- Summary generation
- Missing-information checks
- Risk-level explanations
- Suggested next steps
- Draft response generation
- Final report generation
- Structured multi-agent demo page
- Review queue demo page
- Architecture page
- Safety reminders for public demo use
- Clear workspace button
- Sample case button
- Request limits to reduce free AI usage

## Safety and Privacy Notes

Arqivo AI is a public demo.

Users should not enter real private or sensitive information, including real names, addresses, ID numbers, phone numbers, emails, medical information, financial information, confidential documents, or private case details.

The main chat page does not store user-entered case text in an Arqivo AI database. The text is held in browser state and clears on refresh or when the user clicks Clear All.

When a user sends a message, the case text is sent to Cloudflare Workers AI for processing. For safety, users should use fake demo text or placeholders instead of real private information.

## Architecture

The project uses three main parts.

```txt
Main Chat Page
Next.js frontend on Vercel
        ↓
Cloudflare Worker
        ↓
Cloudflare Workers AI
```

```txt
Agent Demo Page
Next.js frontend on Vercel
        ↓
FastAPI backend
        ↓
Hugging Face Spaces
```

```txt
Structured Agents
Intake Agent
Summary Agent
Missing Information Agent
Risk Agent
Planner Agent
Message Drafting Agent
Quality Review / Audit-style outputs
```

## Tech Stack

- Frontend: Next.js, TypeScript, Tailwind CSS
- Main AI Chat: Cloudflare Workers AI
- Chat API Layer: Cloudflare Worker
- Backend Demo API: FastAPI, Python
- Backend Hosting: Hugging Face Spaces
- Frontend Hosting: Vercel
- Worker Hosting: Cloudflare Workers

## Main Chat Flow

```txt
User enters demo case text
        ↓
User asks a question
        ↓
Frontend sends case text and question to Cloudflare Worker
        ↓
Cloudflare Workers AI generates a response
        ↓
Response appears in the chat
```

The main chat can help with questions like:

- Summarize this case
- What information is missing?
- What is the risk level?
- What should the worker do next?
- Draft a response
- Generate a final report

## Agent Demo Flow

The agent demo page shows the structured multi-agent workflow behind the project.

```txt
Case text
   ↓
Intake Agent
   ↓
Summary Agent
   ↓
Missing Information Agent
   ↓
Risk Agent
   ↓
Planner Agent
   ↓
Drafting / Review Output
```

This page is useful for showing how a case can be broken down into separate review steps.

## Important Limits

Cloudflare Workers AI is used for the main chatbot. The app is designed to reduce unnecessary usage by limiting the amount of case text, chat history, and output length sent with each request.

Only a limited amount of case text is sent with each chat request. If the free AI limit is reached or the Cloudflare Worker is unavailable, the chat may fail temporarily.

## Local Development

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at:

```txt
http://localhost:3000
```

### FastAPI Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

The backend runs at:

```txt
http://localhost:8000
```

### Cloudflare Worker

```bash
cd cloudflare-worker
npm install
npx wrangler deploy
```

## Environment Variables

For Vercel, configure these environment variables:

```txt
NEXT_PUBLIC_CHAT_API_URL=<your Cloudflare Worker URL>
NEXT_PUBLIC_API_URL=<your FastAPI backend URL>
```

`NEXT_PUBLIC_CHAT_API_URL` is used by the main chatbot.

`NEXT_PUBLIC_API_URL` is used by the FastAPI-backed agent demo.

## Deployment

### Frontend

The frontend is hosted on Vercel.

After pushing changes to GitHub, redeploy the Vercel project if needed.

### Cloudflare Worker

The Cloudflare Worker is deployed with Wrangler:

```bash
cd cloudflare-worker
npx wrangler deploy
```

### Hugging Face Backend

The FastAPI backend is hosted on Hugging Face Spaces and supports the structured agent demo routes.

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

## Status

Arqivo AI currently runs as a public full-stack demo with:

- Vercel frontend
- Cloudflare Workers AI chatbot
- Hugging Face FastAPI backend for structured agent demos
- Safety reminders for user-entered text
- Request limits to reduce AI usage

## Disclaimer

Arqivo AI is a demo project. It should not be used as a replacement for professional judgment, legal advice, medical advice, financial advice, government decision-making, or official case review.

A human should always review the output before taking action.