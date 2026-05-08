import datetime
from typing import Annotated

from sqlalchemy import String, DateTime, UniqueConstraint, ForeignKey, Integer, Text, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


created_at_dt = Annotated[
    datetime.datetime, mapped_column(DateTime, default=func.now())
]
updated_at_dt = Annotated[
    datetime.datetime, mapped_column(DateTime, default=func.now(), onupdate=func.now)
]


class ChatsOrm(Base):
    __tablename__ = "chats"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[created_at_dt]
    updated_at: Mapped[updated_at_dt]


class MessagesOrm(Base):
    __tablename__ = "messages"

    __table_args__ = (UniqueConstraint("chat_id", "ordinal", "content"),)

    id: Mapped[str] = mapped_column(String, primary_key=True)
    chat_id: Mapped[str] = mapped_column(String, ForeignKey("chats.id", ondelete="CASCADE"), primary_key=True)
    ordinal: Mapped[int] = mapped_column(Integer, nullable=False)
    role: Mapped[str] = mapped_column(String, nullable=False)
    content: Mapped[str] = mapped_column(Text)
    created_at: Mapped[created_at_dt]
    updated_at: Mapped[updated_at_dt]
