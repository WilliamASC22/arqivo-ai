from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from agents import run_all_agents
from sample_data import SAMPLE_CASES
from chat_agent import get_chat_response


app = FastAPI(title="Arqivo AI Backend")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    text: str


class ChatRequest(BaseModel):
    message: str
    case_text: str = ""
    history: list[dict] = []


@app.get("/")
def home():
    return {
        "message": "Arqivo AI backend is running.",
        "status": "ok",
    }


@app.get("/sample-cases")
def get_sample_cases():
    return SAMPLE_CASES


@app.post("/analyze")
def analyze_case(request: AnalyzeRequest):
    result = run_all_agents(request.text)
    return result


@app.post("/chat")
def chat(request: ChatRequest):
    result = get_chat_response(
        request.message,
        request.case_text,
        request.history,
    )

    return result