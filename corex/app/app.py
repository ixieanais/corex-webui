import uvicorn
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles

import config
from api import router as api_router
from pages import pages_router


async def not_found(request: Request, exc: HTTPException):
    return RedirectResponse("/")


app = FastAPI()
app.mount("/static", StaticFiles(directory=config.STATIC_DIR), name="static")
app.include_router(api_router)
app.include_router(pages_router)
app.add_exception_handler(exc_class_or_status_code=404, handler=not_found)


if __name__ == "__main__":
    uvicorn.run("app:app", host="127.0.0.1", port=8080)
