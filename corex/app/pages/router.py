from fastapi import APIRouter, Request
from fastapi.responses import RedirectResponse
from fastapi.templating import Jinja2Templates

from database import get_chats
from config import TEMPLATES_DIR


router = APIRouter(tags=["pages"])
templates = Jinja2Templates(directory=TEMPLATES_DIR)


@router.get("/")
async def root_page(request: Request):
    return templates.TemplateResponse(request=request, name="index.html")


@router.get("/chat/{id}")
async def chat_page(id: str, request: Request):
    chats = get_chats()
    for chat in chats:
        if id in chat:
            return templates.TemplateResponse(request=request, name="index.html")
    return RedirectResponse("/")
