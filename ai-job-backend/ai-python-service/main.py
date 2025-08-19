from fastapi import FastAPI
from models import *
from services import *

app = FastAPI(title="AI Job Assistant")

@app.post("/summarize", response_model=SummarizeResponse)
def summarize_endpoint(request: SummarizeRequest):
    summary = summarize_resume(request.resumeText)
    return SummarizeResponse(summary=summary)

@app.post("/generate/resume", response_model=GenerateResumeResponse)
def generate_resume_endpoint(request: GenerateResumeRequest):
    optimized = generate_optimized_resume(request.resumeText, request.jobDescription)
    return GenerateResumeResponse(optimizedResumeMarkdown=optimized, model="sshleifer/distilbart-cnn-12-6")

@app.post("/cover", response_model=CoverLetterResponse)
def cover_letter_endpoint(request: CoverLetterRequest):
    cover = generate_cover_letter(request.resumeText, request.jobDescription)
    return CoverLetterResponse(coverLetterMarkdown=cover, model="sshleifer/distilbart-cnn-12-6")

@app.post("/simulate/interview", response_model=SimulateInterviewResponse)
def simulate_interview_endpoint(request: SimulateInterviewRequest):
    qa = simulate_interview(request.resumeText, request.jobDescription)
    return SimulateInterviewResponse(qa=qa, model="sshleifer/distilbart-cnn-12-6")
