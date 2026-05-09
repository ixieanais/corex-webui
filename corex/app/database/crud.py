from typing import Union

from sqlalchemy import text
from sqlalchemy.exc import NoResultFound

from .database import engine, session_factory
from .models import Base, ChatsOrm, MessagesOrm


async def create_tables() -> None:
    async with engine.connect() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await conn.commit()


async def insert_chat(id: str, name: str) -> None:
    async with session_factory() as session:
        chat = ChatsOrm(id=id, name=name)
        session.add(chat)
        await session.commit()


async def select_chats() -> Union[list[dict], list]:
    async with session_factory() as session:
        stmt = text("SELECT * FROM chats ORDER BY updated_at DESC")
        result = await session.execute(stmt)
        rows = result.mappings().all()
        return [dict(row) for row in rows]


async def select_chat(id: str) -> dict:
    async with session_factory() as session:
        stmt = text("SELECT * FROM chats WHERE id = :id").bindparams(id=id)
        result = await session.execute(stmt)
        try:
            row = result.mappings().one()
            return dict(row)
        except NoResultFound:
            return {}


async def update_chat(id: str, name: str) -> None:
    async with session_factory() as session:
        stmt = text("UPDATE chats SET name = :name WHERE id = :id").bindparams(
            id=id, name=name
        )
        await session.execute(stmt)
        await session.commit()


async def delete_chat(id: str) -> None:
    async with session_factory() as session:
        stmt = text("DELETE FROM chats WHERE id = :id").bindparams(id=id)
        await session.execute(stmt)
        await session.commit()


async def insert_message(
    id: str, chat_id: str, ordinal: int, role: str, content: str
) -> None:
    async with session_factory() as session:
        message = MessagesOrm(
            id=id, chat_id=chat_id, ordinal=ordinal, role=role, content=content
        )
        session.add(message)
        await session.commit()


async def select_messages(chat_id: str) -> Union[list[dict], list]:
    async with session_factory() as session:
        stmt = text("SELECT * FROM messages WHERE chat_id = :chat_id ORDER BY created_at ASC").bindparams(
            chat_id=chat_id
        )
        result = await session.execute(stmt)
        rows = result.mappings().all()
        return [dict(row) for row in rows]


async def select_message(id: str) -> dict:
    async with session_factory() as session:
        stmt = text("SELECT * FROM messsages WHERE id = :id").bindparams(id=id)
        result = await session.execute(stmt)
        try:
            row = result.mappings().one()
            return dict(row)
        except NoResultFound:
            return {}


async def update_message(id: str, content: str) -> None:
    async with session_factory() as session:
        stmt = text("UPDATE messages SET content = :content WHERE id = :id").bindparams(
            id=id, content=content
        )
        await session.execute(stmt)
        await session.commit()


async def delete_message(id: str) -> None:
    async with session_factory() as session:
        stmt = text("DELETE FROM messages WHERE id = :id").bindparams(id=id)
        await session.execute(stmt)
        await session.commit()
