"""AI service endpoints — legal-specific capabilities powered by SiliconFlow."""
from fastapi import APIRouter, HTTPException, status
from app.services import get_silicon_flow_service
from app.services.base import AIServiceError
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

# ── Request / Response schemas ────────────────────────────────────────────

class CompletionRequest(BaseModel):
    prompt: str
    system_prompt: Optional[str] = None
    max_tokens: Optional[int] = None
    temperature: Optional[float] = None

class CompletionResponse(BaseModel):
    response: str

class SummarizeRequest(BaseModel):
    text: str
    context: Optional[str] = None
    max_length: Optional[str] = "concise"  # concise | detailed | bullet_points

class DraftEmailRequest(BaseModel):
    subject: str
    context: str
    tone: Optional[str] = "professional"   # professional | formal | friendly
    key_points: Optional[list[str]] = None

class TimeDescriptionRequest(BaseModel):
    activity_type: str
    matter_name: Optional[str] = None
    notes: Optional[str] = None

class MatterAnalysisRequest(BaseModel):
    matter_name: str
    practice_area: str
    description: str
    client_name: Optional[str] = None

class ChatMessage(BaseModel):
    role: str   # "user" | "assistant"
    content: str

class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    system_prompt: Optional[str] = None

# ── Helpers ───────────────────────────────────────────────────────────────

def _get_service():
    service = get_silicon_flow_service()
    if not service:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service not configured. Set SILICONFLOW_API_KEY in backend/.env"
        )
    return service

async def _complete(service, prompt: str, system: str, max_tokens: int = 1024, temperature: float = 0.7) -> str:
    try:
        return await service.generate_completion(
            prompt=prompt,
            system_prompt=system,
            max_tokens=max_tokens,
            temperature=temperature,
        )
    except AIServiceError as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))

# ── Endpoints ─────────────────────────────────────────────────────────────

@router.post("/completion", response_model=CompletionResponse)
async def generate_completion(request: CompletionRequest):
    """Generic AI completion — used by the Help page chat."""
    service = _get_service()
    response = await _complete(
        service,
        request.prompt,
        request.system_prompt or "You are a helpful assistant for a legal practice management system.",
        request.max_tokens or 1024,
        request.temperature or 0.7,
    )
    return CompletionResponse(response=response)


@router.post("/summarize", response_model=CompletionResponse)
async def summarize_document(request: SummarizeRequest):
    """Summarize a legal document or text passage."""
    service = _get_service()
    format_instruction = {
        "concise": "Provide a concise 3-5 sentence summary.",
        "detailed": "Provide a detailed summary covering all key points.",
        "bullet_points": "Summarize as a structured bullet-point list of key provisions and obligations.",
    }.get(request.max_length or "concise", "Provide a concise summary.")
    system = (
        "You are a legal document analyst for an international law firm. "
        "Extract key legal provisions, obligations, dates, and risks clearly and accurately. "
        f"{format_instruction}"
    )
    context_line = f"\nDocument context: {request.context}" if request.context else ""
    prompt = f"Please summarize the following legal text:{context_line}\n\n{request.text}"
    response = await _complete(service, prompt, system, max_tokens=800, temperature=0.3)
    return CompletionResponse(response=response)


@router.post("/draft-email", response_model=CompletionResponse)
async def draft_email(request: DraftEmailRequest):
    """Draft a professional legal correspondence email."""
    service = _get_service()
    tone_desc = {
        "professional": "professional and precise",
        "formal": "formal and authoritative",
        "friendly": "friendly yet professional",
    }.get(request.tone or "professional", "professional")
    system = (
        "You are a legal communications expert helping lawyers draft emails. "
        f"Write in a {tone_desc} tone. Be clear, concise, and appropriate for legal correspondence. "
        "Output only the email body (no subject line)."
    )
    key_points_text = ""
    if request.key_points:
        key_points_text = "\nKey points to include:\n" + "\n".join(f"- {p}" for p in request.key_points)
    prompt = (
        f"Draft an email with the subject: '{request.subject}'\n"
        f"Context: {request.context}{key_points_text}"
    )
    response = await _complete(service, prompt, system, max_tokens=600, temperature=0.6)
    return CompletionResponse(response=response)


@router.post("/suggest-time-description", response_model=CompletionResponse)
async def suggest_time_description(request: TimeDescriptionRequest):
    """Generate a professional billable time entry description from rough notes."""
    service = _get_service()
    system = (
        "You are a legal billing specialist. Generate a clear, concise, professional time entry "
        "description suitable for a client invoice. Use active voice, be specific but brief "
        "(1-2 sentences). Do not include time amounts — just the description of work performed."
    )
    matter_line = f" for matter '{request.matter_name}'" if request.matter_name else ""
    notes_line = f"\nLawyer's rough notes: {request.notes}" if request.notes else ""
    prompt = f"Generate a professional billing description for: {request.activity_type}{matter_line}{notes_line}"
    response = await _complete(service, prompt, system, max_tokens=150, temperature=0.5)
    return CompletionResponse(response=response)


@router.post("/analyze-matter", response_model=CompletionResponse)
async def analyze_matter(request: MatterAnalysisRequest):
    """Provide strategic analysis and next-step recommendations for a matter."""
    service = _get_service()
    system = (
        "You are a senior legal strategist. Analyze the given matter and provide: "
        "1) Key risks and issues, 2) Recommended immediate next steps, 3) Timeline considerations, "
        "4) Standard documents typically needed. Be practical and actionable."
    )
    client_line = f"\nClient: {request.client_name}" if request.client_name else ""
    prompt = (
        f"Analyze this legal matter:\n"
        f"Matter: {request.matter_name}\nPractice Area: {request.practice_area}"
        f"{client_line}\nDescription: {request.description}"
    )
    response = await _complete(service, prompt, system, max_tokens=1200, temperature=0.4)
    return CompletionResponse(response=response)


@router.post("/chat", response_model=CompletionResponse)
async def chat(request: ChatRequest):
    """Multi-turn AI chat for the persistent AI assistant panel."""
    service = _get_service()
    default_system = (
        "You are a helpful AI assistant embedded in Legal CMS, a legal practice management system. "
        "Help lawyers with: drafting emails, summarizing documents, billing descriptions, "
        "deadline tracking, client communication, and platform usage. "
        "Be concise and practical. Do not provide specific legal advice."
    )
    history = "\n".join(
        f"{'User' if m.role == 'user' else 'Assistant'}: {m.content}"
        for m in request.messages[:-1]
    )
    last_message = request.messages[-1].content if request.messages else ""
    prompt = f"{history}\nUser: {last_message}" if history else last_message
    response = await _complete(
        service, prompt,
        request.system_prompt or default_system,
        max_tokens=1024, temperature=0.7
    )
    return CompletionResponse(response=response)
