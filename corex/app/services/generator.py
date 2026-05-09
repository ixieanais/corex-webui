from ollama import AsyncClient
from utils import search
from database import crud


async def text_generation(
    chat_id: str,
    model: str,
    history: list[dict],
    system_msg: str | None = None,
    web_search: bool = False,
    agent: bool = False
):
    try:
        client = AsyncClient()
        message = history[-1]["content"]
        results = None

        if web_search:
            if agent:
                response = await client.generate(
                    model=model,
                    prompt=message,
                    system="You are an AI Agent for writing Google queries. Write a clean query for the user to search the internet.",
                    think=False
                )
                message = response.response
            results = search(message)

        messages = []
        if system_msg:
            messages.append({"role": "system", "content": system_msg})

        messages.append({"role": item["role"], "content": item["content"]} for item in history)

        if results:
            messages.append({"role": "user", "type": "search", "content": f"Search results: {results}"})

        async for chunk in await client.chat(
            model=model,
            messages=messages,
            stream=True,
        ):
            content = chunk.message.content
            yield content
            await crud.update_message(chat_id, content)

    except Exception as e:
        yield f"ERROR: {e}"
        await crud.update_message(chat_id, f"ERROR: {e}")
