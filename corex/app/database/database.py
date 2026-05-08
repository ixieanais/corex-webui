from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy_utils import create_database, database_exists

import config


engine = create_async_engine(url=config.DATABASE_URL)


if not database_exists(config.DATABASE_URL_PSYCOPG):
    create_database(config.DATABASE_URL_PSYCOPG)


session_factory = async_sessionmaker(engine)
