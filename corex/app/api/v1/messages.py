from fastapi import APIRouter

import database
from schemas import InsertUserMessageData


router = APIRouter(tags=["messages"])


@router.post("/insert_user_message")
async def api_insert_user_message(data: InsertUserMessageData):
    database.insert_user_message(data.id, data.message)
    return {"id": data.id, "message": data.message}
