from fastapi import APIRouter

from .v1.chats import router as chats_router
from .v1.messages import router as messages_router
from .v1.assistant import router as assistant_router
from .v1.models import router as models_router


router = APIRouter(prefix="/api")
router.include_router(chats_router)
router.include_router(messages_router)
router.include_router(assistant_router)
router.include_router(models_router)
