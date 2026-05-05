import os
from pathlib import Path

from dotenv import load_dotenv


BASE_DIR = Path(os.getcwd())
PARENT_DIR = BASE_DIR.parent
STATIC_DIR = PARENT_DIR / "static"
TEMPLATES_DIR = PARENT_DIR / "templates"
DATA_DIR = PARENT_DIR / "data"
COREX_DIR = BASE_DIR.parent.parent
DOTENV_PATH = COREX_DIR / ".env"

load_dotenv(DOTENV_PATH)

DATABASE_URL = f"postgresql+asyncpg://{os.getenv('DB_USER')}:{os.getenv('DB_PASS')}@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
DATABASE_URL_PSYCOPG = DATABASE_URL.replace("asyncpg", "psycopg")
