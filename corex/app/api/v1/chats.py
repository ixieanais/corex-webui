import uuid

from fastapi import APIRouter

import database
from schemas import CreateChatData, RenameChatData


router = APIRouter(tags=["chats"])


@router.post("/create_chat")
async def api_create_chat(data: CreateChatData):
    chat_id = str(uuid.uuid4())
    database.chat_create(chat_id, data.name, data.message)
    return chat_id


@router.patch("/rename_chat")
async def api_rename_chat(data: RenameChatData):
    database.chat_rename(data.id, data.name)
    return {"id": data.id, "name": data.name}


@router.delete("/delete_chat/{id}")
async def api_delete_chat(id: str):
    database.chat_delete(id)
    return {"id": id}


@router.get("/get_chat_history/{id}")
async def api_get_chat_history(id: str):
    chat_history = database.get_chat_history(id)
    return [{"role": r, "content": c} for r,c in chat_history]


@router.get("/get_chats")
async def api_get_chats():
    chats = database.get_chats()
    return chats


@router.get("/get_chat_title/{id}")
async def api_get_chat_title(id: str):
    title = database.get_chat_title(id)
    return title
