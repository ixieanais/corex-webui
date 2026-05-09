from uuid import uuid4

from fastapi import APIRouter

from database import crud
from schemas import ChatSchema


router = APIRouter(tags=["chats"])


@router.post("/chats")
async def create_chat(schema: ChatSchema):
    id = str(uuid4())
    await crud.insert_chat(id, schema.name)
    return id


@router.get("/chats")
async def get_chats():
    return await crud.select_chats()


@router.get("/chats/{id}")
async def get_chat(id: str):
    return await crud.select_chat(id)


@router.patch("/chats/{id}")
async def update_chat(id: str, schema: ChatSchema):
    await crud.update_chat(id, schema.name)


@router.delete("/chats/{id}")
async def delete_chat(id: str):
    await crud.delete_chat(id)
