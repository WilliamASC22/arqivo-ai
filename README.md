# Arqivo AI

Arqivo AI is a full-stack AI case-assistant demo that helps users turn messy case notes, emails, requests, and document text into organized summaries, missing-information checks, risk explanations, next-step plans, draft responses, and review-ready reports.

The project is designed to show how AI can support case review workflows in a clear, safe, and human-in-the-loop way. Arqivo AI does not make final decisions automatically. It helps organize information so a person can review the output faster and more carefully.

---

## What Arqivo AI Does

Arqivo AI helps users review case-style text by breaking it into useful parts.

It can help users:

Summarize a case in simple language

Find missing documents or missing information

Explain possible risk level

Identify deadlines or time-sensitive language

Recommend next steps

Draft a response message

Create a review-ready report

Show which agents or checks were used

Create an audit-style record of the workflow

Build a clean case packet before using the AI

The goal is not to replace a human reviewer. The goal is to help a human reviewer understand the case more quickly.

---

## Main Features

Public AI chatbot interface

User-editable case workspace

Case Builder for preparing cleaner case packets

Built-in safety reminder before sending text

Sample case examples for quick testing

Cloudflare Workers AI integration for the main chat

Cloudflare Worker API layer for the chat endpoint

FastAPI backend for the structured agent demo

Multi-agent workflow demo

Missing-information checks

Risk scoring and risk explanations

Deadline and document checks

Priority and eligibility checks

Draft message generation

Tone and quality review

Audit log output

Clear workspace and sample case controls

Vercel frontend deployment

Cloudflare Worker deployment for the main chat endpoint

Hugging Face Spaces backend deployment for the agent demo

---

## How the App Is Organized

Arqivo AI has three main user experiences.

### 1. Main Chat Page

The main chat page lets a user paste fake case text and ask Arqivo questions.

Example questions include:

Summarize this case

What information is missing?

What is the risk level?

Recommend next steps

Draft a response

Generate a final report

Which agents are being used?

This page uses the Cloudflare Worker and Cloudflare Workers AI.

```txt
Client
-> Vercel Frontend
-> Cloudflare Worker
-> Cloudflare Workers AI
```

### 2. Case Builder Page

The Case Builder helps users prepare better input before sending text to Arqivo AI.

Users can choose a fake sample case, edit the case type, add a person or role, add a deadline, describe the main request, list included documents, list missing information, and generate a clean case packet.

The Case Builder replaced the old Review Queue page because it is more useful for a public demo. Instead of pretending to approve fake cases, it helps users create better case text that can be copied into Chat or the Agent Demo.

### 3. Agent Demo Page

The Agent Demo page shows a more structured backend workflow. It runs a set of focused Python agents that each check a different part of the case.

This page uses the FastAPI backend.

```txt
Client
-> Vercel Frontend
-> FastAPI Backend
-> Structured Agent Pipeline
```

---

## Structured Agent Pipeline

The FastAPI agent demo uses the following workflow:

```txt
Input Text
-> Safety Agent
-> Intake Agent
-> Summary Agent
-> Missing Information Agent
-> Document Agent
-> Deadline Agent
-> Risk Agent
-> Eligibility Agent
-> Priority Agent
-> Planner Agent
-> Message Agent
-> Tone Agent
-> Quality Agent
-> Audit Log Agent
-> Final Report
```

---

## Agent Roles

### Safety Agent

Checks for possible private or sensitive information.

### Intake Agent

Finds the case type, important dates, keywords, and main request.

### Summary Agent

Creates a simple summary of the case.

### Missing Information Agent

Checks what required information is missing.

### Document Agent

Compares included documents against required documents.

### Deadline Agent

Looks for deadlines and time-sensitive language.

### Risk Agent

Scores the case based on missing information, deadlines, urgency, and suspicious text.

### Eligibility Agent

Estimates whether the case may be ready for review.

### Priority Agent

Decides whether the case should be handled normally or reviewed quickly.

### Planner Agent

Creates recommended next steps.

### Message Agent

Drafts a response message.

### Tone Agent

Checks that the draft sounds clear, respectful, and professional.

### Quality Agent

Reviews the final output for warnings.

### Audit Log Agent

Creates a simple record of what the system checked.

---

## Example Use Cases

Arqivo AI can be used with fake sample cases like:

Rent assistance requests

Student appeal requests

Refund or duplicate charge requests

Benefits renewal requests

Missing paperwork requests

Address update requests

General case notes or support requests

Example prompts:

```txt
Summarize this case.
```

```txt
What information is missing?
```

```txt
What is the risk level?
```

```txt
Recommend next steps.
```

```txt
Draft a response.
```

```txt
Generate a final report.
```

```txt
Which agents are being used?
```

---

## Safety Notes

Arqivo AI is a public demo.

Users should not enter real private or sensitive information, including real names, addresses, ID numbers, phone numbers, emails, medical information, financial information, confidential documents, or private case details.

Users should use fake demo text or placeholders.

The main chat page does not store user-entered case text in an Arqivo AI database. The text is held in browser state and clears on refresh or when the user clicks Clear All.

When a user sends a message on the main chat page, the case text is sent to Cloudflare Workers AI for processing. The structured agent demo sends text to the FastAPI backend for rule-based analysis.

A human should always review the output before taking action.

---

## Tech Stack

### Frontend

Next.js

TypeScript

Tailwind CSS

Vercel

### Main Chat AI

Cloudflare Worker

Cloudflare Workers AI

Wrangler

### Agent Demo Backend

Python

FastAPI

Uvicorn

Hugging Face Spaces

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
│   │   ├── case-builder/
│   │   ├── demo/
│   │   ├── about/
│   │   ├── agents/
│   │   ├── architecture/
│   │   └── components/
│   ├── package.json
│   └── package-lock.json
│
└── README.md
```

---

## Running Locally

After cloning the repository, open the project folder.

```bash
cd arqivo-ai
```

---

## 1. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Open your browser and visit:

```txt
http://localhost:3000
```

---

## 2. Start the FastAPI Backend

The FastAPI backend powers the structured agent demo.

Open a new terminal window.

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

The backend runs at:

```txt
http://localhost:8000
```

---

## 3. Deploy or Update the Cloudflare Worker

The Cloudflare Worker powers the main AI chatbot.

```bash
cd cloudflare-worker
npm install
npx wrangler deploy
```

---

## Environment Variables

For local development or Vercel deployment, configure these environment variables:

```txt
NEXT_PUBLIC_CHAT_API_URL=<your Cloudflare Worker URL>
NEXT_PUBLIC_API_URL=<your FastAPI backend URL>
```

### NEXT_PUBLIC_CHAT_API_URL

Used by the main chatbot page.

Example:

```txt
NEXT_PUBLIC_CHAT_API_URL=https://arqivo-ai-chat.your-subdomain.workers.dev
```

### NEXT_PUBLIC_API_URL

Used by the FastAPI-backed Agent Demo page.

Example:

```txt
NEXT_PUBLIC_API_URL=https://your-fastapi-backend-url
```

---

## Deployment Overview

Arqivo AI uses multiple deployment targets.

```txt
Frontend:
Vercel
```

```txt
Main Chat:
Cloudflare Worker and Cloudflare Workers AI
```

```txt
Agent Demo Backend:
FastAPI backend hosted on Hugging Face Spaces
```

When updating frontend pages, redeploy Vercel.

When updating the main chat logic, redeploy the Cloudflare Worker.

When updating the structured agent demo, redeploy or restart the FastAPI backend.

---

## Why This Project Matters

Many real-world workflows involve messy notes, incomplete documents, unclear requests, and time-sensitive decisions. Arqivo AI shows how an AI system can help organize that information into a clearer format.

The project demonstrates full-stack development, frontend and backend integration, AI API integration, cloud deployment, human-in-the-loop design, multi-agent workflow design, safety-aware AI product thinking, and clear user experience design.

---

## Important Disclaimer

Arqivo AI is a demo project.

It should not be used as legal advice, medical advice, financial advice, government decision-making, official case review, or a replacement for trained staff or professional judgment.

A human should always review the output before taking action.