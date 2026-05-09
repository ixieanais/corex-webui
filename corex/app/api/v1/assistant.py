from uuid import uuid4

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from database import crud
from services.generator import text_generation
from schemas import ChatRequest


router = APIRouter(tags=["assistant"])


@router.post("/assistant/typing")
async def api_assistant_typing(schema: ChatRequest):
    messages = await crud.select_messages(schema.id)
    id = str(uuid4())
    await crud.insert_message(id, schema.id, 1, "assistant", "")
    return StreamingResponse(
        text_generation(
            chat_id=schema.id,
            model=schema.model,
            chat_history=messages,
            web_search=schema.search,
        ),
        media_type="text/event-stream",
    )
