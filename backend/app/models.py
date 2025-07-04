from sqlalchemy import Column, Integer, String, DateTime, JSON, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
from sqlalchemy.orm import relationship
from pydantic import BaseModel
from typing import List, Optional

Base = declarative_base()

class APIRequest(Base):
    __tablename__ = "api_requests"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, index=True)
    method = Column(String)
    headers = Column(JSON)
    body = Column(JSON, nullable=True)
    query_params = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class TestResult(Base):
    __tablename__ = "test_results"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("api_requests.id"))
    status_code = Column(Integer)
    response_time = Column(Integer)  # in milliseconds
    response_body = Column(JSON, nullable=True)
    test_status = Column(String)  # pass/fail/skipped
    created_at = Column(DateTime, default=datetime.utcnow)

class Folder(Base):
    __tablename__ = "folders"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    testcases = relationship("TestCase", back_populates="folder", cascade="all, delete-orphan")

class TestCase(Base):
    __tablename__ = "testcases"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    folder_id = Column(Integer, ForeignKey("folders.id"), nullable=False)
    path = Column(String, nullable=False)
    code = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    folder = relationship("Folder", back_populates="testcases")

class TestCaseResult(Base):
    __tablename__ = "testcase_results"
    id = Column(Integer, primary_key=True, index=True)
    test_case_id = Column(Integer, ForeignKey("testcases.id"), nullable=False)
    folder_id = Column(Integer, ForeignKey("folders.id"), nullable=False)
    status = Column(String, nullable=False)  # pass/fail
    reason = Column(String, nullable=True)
    stdout = Column(String, nullable=True)
    stderr = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    test_case = relationship("TestCase")
    folder = relationship("Folder")

# Pydantic Schemas
class TestCaseSchema(BaseModel):
    id: int
    name: str
    folder_id: int
    path: str
    code: Optional[str] = None
    created_at: datetime
    class Config:
        orm_mode = True

class FolderSchema(BaseModel):
    id: int
    name: str
    created_at: datetime
    testcases: Optional[List[TestCaseSchema]] = []
    class Config:
        orm_mode = True

class FolderCreateSchema(BaseModel):
    name: str

class TestCaseCreateSchema(BaseModel):
    name: str
    folder_id: int
    path: str
    code: Optional[str] = None

class TestCaseResultSchema(BaseModel):
    id: int
    test_case_id: int
    folder_id: int
    status: str
    reason: Optional[str] = None
    stdout: Optional[str] = None
    stderr: Optional[str] = None
    created_at: datetime
    class Config:
        orm_mode = True 