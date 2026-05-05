import uuid

from fastapi import APIRouter

import database
from schemas import CreateChatData, RenameChatData


router = APIRouter(tags=["chats"])


@router.post("/chats")
async def create_chat(data: CreateChatData):
    chat_id = str(uuid.uuid4())
    database.chat_create(chat_id, data.name, data.message)
    return chat_id


@router.get("/chats")
async def get_chats():
    chats = database.get_chats()
    return chats


@router.get("/chats/{id}")
async def get_chat(id: str):
    chat_history = database.get_chat_history(id)
    return [{"role": r, "content": c} for r,c in chat_history]


@router.get("/chats/{id}/title")
async def api_get_chat_title(id: str):
    title = database.get_chat_title(id)
    return title


@router.patch("/chats/{id}")
async def update_chat(id: str, data: RenameChatData):
    database.chat_rename(id, data.name)
    return {"id": id, "name": data.name}


@router.delete("/chats/{id}")
async def delete_chat(id: str):
    database.chat_delete(id)
    return {"id": id}
