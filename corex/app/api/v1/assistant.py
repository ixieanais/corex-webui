from fastapi import APIRouter
from fastapi.responses import StreamingResponse

import database
from services.generator import text_generation
from schemas import ChatRequest


router = APIRouter(tags=["assistant"])


@router.post("/assistant_typing")
async def api_assistant_typing(data: ChatRequest):
    chat_history = database.get_chat_history(data.id)
    database.insert_assistant_message(data.id)
    return StreamingResponse(
        text_generation(
            chat_id=data.id,
            model=data.model,
            chat_history=chat_history,
            web_search=data.search,
        ),
        media_type="text/event-stream",
    )
