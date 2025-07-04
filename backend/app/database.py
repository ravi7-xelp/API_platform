from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from . import models

SQLALCHEMY_DATABASE_URL = "sqlite:///./api_testing.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Create all tables
models.Base.metadata.create_all(bind=engine)

# NOTE: After updating the TestCase model, you must run a migration to add the 'code' column to the testcases table.
# Example Alembic migration (if using Alembic):
# op.add_column('testcases', sa.Column('code', sa.String(), nullable=True)) 