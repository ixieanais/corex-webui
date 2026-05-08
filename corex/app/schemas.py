from typing import Optional

from pydantic import BaseModel, Field


class CreateChatData(BaseModel):
    name: str
    message: str


class RenameChatData(BaseModel):
    name: str


class MessageSchema(BaseModel):
    ordinal: Optional[int] = Field(default=None)
    role: Optional[str] = Field(default=None)
    content: str


class ChatRequest(BaseModel):
    id: str
    model: str
    search: bool
