# Arqivo AI

Arqivo AI is a full-stack AI case-assistant demo that helps users turn messy case notes, emails, requests, and document text into organized summaries, missing-information checks, risk explanations, next-step plans, draft responses, and review-ready reports.

The project is designed to show how AI can support case review workflows in a clear, safe, and human-in-the-loop way. Arqivo AI does not make final decisions automatically. Instead, it helps organize information so a person can review the output faster and more carefully.

---

## What Arqivo AI Does

Arqivo AI helps users review case-style text by breaking it into useful parts.

It can help with:

* Summarizing a case in simple language
* Finding missing documents or missing information
* Explaining possible risk level
* Identifying deadlines or time-sensitive language
* Recommending next steps
* Drafting a response message
* Creating a review-ready report
* Showing which agents or checks were used
* Creating an audit-style record of the workflow

The goal is not to replace a human reviewer. The goal is to help a human reviewer understand the case more quickly.

---

## Main Features

* Public AI chatbot interface
* User-editable case workspace
* Built-in safety reminder before sending text
* Sample case examples for quick testing
* Cloudflare Workers AI integration for the main chat
* FastAPI backend for the structured agent demo
* Multi-agent workflow demo
* Missing-information checks
* Risk scoring and risk explanations
* Deadline and document checks
* Priority and eligibility checks
* Draft message generation
* Tone and quality review
* Audit log output
* Clear workspace and sample case controls
* Vercel frontend deployment
* Cloudflare Worker deployment for the main chat endpoint
* Hugging Face Spaces backend deployment for the agent demo

---

## How the App Is Organized

Arqivo AI has two main AI experiences.

### 1. Main Chat Page

The main chat page lets a user paste fake case text and ask Arqivo questions.

Example questions include:

* Summarize this case
* What information is missing?
* What is the risk level?
* Recommend next steps
* Draft a response
* Generate a final report
* Which agents are being used?

This page uses the Cloudflare Worker and Cloudflare Workers AI.

```txt
Client
-> Vercel Frontend
-> Cloudflare Worker
-> Cloudflare Workers AI
```

### 2. Agent Demo Page

The agent demo page shows a more structured backend workflow. It runs a set of focused Python agents that each check a different part of the case.

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

### Agent Roles

| Agent                     | What It Does                                                                           |
| ------------------------- | -------------------------------------------------------------------------------------- |
| Safety Agent              | Checks for possible private or sensitive information.                                  |
| Intake Agent              | Finds the case type, important dates, and keywords.                                    |
| Summary Agent             | Creates a simple summary of the case.                                                  |
| Missing Information Agent | Checks what required information is missing.                                           |
| Document Agent            | Compares included documents against required documents.                                |
| Deadline Agent            | Looks for deadlines and time-sensitive language.                                       |
| Risk Agent                | Scores the case based on missing information, deadlines, urgency, and suspicious text. |
| Eligibility Agent         | Estimates whether the case may be ready for review.                                    |
| Priority Agent            | Decides whether the case should be handled normally or quickly.                        |
| Planner Agent             | Creates recommended next steps.                                                        |
| Message Agent             | Drafts a response message.                                                             |
| Tone Agent                | Checks that the draft sounds clear, respectful, and professional.                      |
| Quality Agent             | Reviews the final output for warnings.                                                 |
| Audit Log Agent           | Creates a simple record of what the system checked.                                    |

---

## Example Use Cases

Arqivo AI can be used with fake sample cases like:

* Rent assistance requests
* Student appeal requests
* Refund or duplicate charge requests
* Benefits renewal requests
* Missing paperwork requests
* Address update requests
* General case notes or support requests

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

Users should not enter real private or sensitive information, including:

* Real names
* Addresses
* ID numbers
* Phone numbers
* Emails
* Medical information
* Financial information
* Confidential documents
* Private case details

Users should use fake demo text or placeholders.

The main chat page does not store user-entered case text in an Arqivo AI database. The text is held in browser state and clears on refresh or when the user clicks Clear All.

When a user sends a message, the case text is sent to Cloudflare Workers AI for processing. The structured agent demo sends text to the FastAPI backend for rule-based analysis.

---

## Tech Stack

### Frontend

* Next.js
* TypeScript
* Tailwind CSS
* Vercel

### Main Chat AI

* Cloudflare Worker
* Cloudflare Workers AI

### Agent Demo Backend

* Python
* FastAPI
* Uvicorn
* Hugging Face Spaces

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

### What They Do

```txt
NEXT_PUBLIC_CHAT_API_URL
```

Used by the main chatbot page.

```txt
NEXT_PUBLIC_API_URL
```

Used by the FastAPI-backed agent demo page.

Example:

```txt
NEXT_PUBLIC_CHAT_API_URL=https://your-worker-name.your-subdomain.workers.dev
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
Cloudflare Worker + Cloudflare Workers AI
```

```txt
Agent Demo Backend:
FastAPI backend hosted on Hugging Face Spaces
```

When updating the frontend, redeploy Vercel.

When updating the main chat logic, redeploy the Cloudflare Worker.

When updating the structured agent demo, redeploy or restart the FastAPI backend.

---

## Why This Project Matters

Many real-world workflows involve messy notes, incomplete documents, unclear requests, and time-sensitive decisions. Arqivo AI shows how an AI system can help organize that information into a clearer format.

The project demonstrates:

* Full-stack development
* Frontend and backend integration
* AI API integration
* Cloud deployment
* Human-in-the-loop design
* Multi-agent workflow design
* Safety-aware AI product thinking
* Clear user experience design

---

## Important Disclaimer

Arqivo AI is a demo project.

It should not be used as:

* Legal advice
* Medical advice
* Financial advice
* Government decision-making
* Official case review
* A replacement for trained staff or professional judgment

A human should always review the output before taking action.