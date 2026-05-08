from uuid import uuid4

from fastapi import APIRouter

from database import crud
from schemas import MessageSchema


router = APIRouter(tags=["messages"])


@router.post("/messages/{chat_id}")
async def create_message(chat_id: str, schema: MessageSchema):
    id = str(uuid4())
    await crud.insert_message(id, chat_id, schema.ordinal, schema.role, schema.content)


@router.get("/messages/{chat_id}")
async def get_messages(chat_id: str):
    return await crud.select_messages(chat_id)


@router.patch("/messages/{id}")
async def update_message(id: str, schema: MessageSchema):
    await crud.update_message(id, schema.content)


@router.delete("/messages/{id}")
async def delete_message(id: str):
    await crud.delete_message(id)
