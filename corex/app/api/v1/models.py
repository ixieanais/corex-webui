import asyncio

import ollama
from fastapi import APIRouter


router = APIRouter(tags=["models"])


@router.get("/models")
async def get_models():
    loop = asyncio.get_event_loop()
    try:
        models_list = await loop.run_in_executor(None, ollama.list)
        models = [model["model"] for model in models_list.models]
        return models
    except Exception as e:
        return f"ERROR: {e}"