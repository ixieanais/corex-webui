from fastapi import APIRouter

from .chats import router as chats_router
from .messages import router as messages_router
from .assistant import router as assistant_router
from .models import router as models_router


router = APIRouter(prefix="/v1")
router.include_router(chats_router)
router.include_router(messages_router)
router.include_router(assistant_router)
router.include_router(models_router)
