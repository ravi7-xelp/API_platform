from sqlalchemy import Column, Integer, String, DateTime, JSON, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

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