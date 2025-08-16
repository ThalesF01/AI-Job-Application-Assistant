from pydantic import BaseModel
from typing import List

class SummarizeRequest(BaseModel):
    resumeText: str

class SummarizeResponse(BaseModel):
    summary: str

class GenerateResumeRequest(BaseModel):
    resumeText: str
    jobDescription: str

class GenerateResumeResponse(BaseModel):
    optimizedResumeMarkdown: str
    model: str

class CoverLetterRequest(BaseModel):
    resumeText: str
    jobDescription: str

class CoverLetterResponse(BaseModel):
    coverLetterMarkdown: str
    model: str

class SimulateInterviewRequest(BaseModel):
    resumeText: str
    jobDescription: str

class QAItem(BaseModel):
    question: str
    answer: str

class SimulateInterviewResponse(BaseModel):
    qa: List[QAItem]
    model: str
