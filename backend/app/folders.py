from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .database import get_db
from .models import Folder, FolderSchema, FolderCreateSchema, TestCaseSchema
from typing import List

router = APIRouter()

@router.post("/folders", response_model=FolderSchema)
def create_folder(folder: FolderCreateSchema, db: Session = Depends(get_db)):
    db_folder = db.query(Folder).filter(Folder.name == folder.name).first()
    if db_folder:
        raise HTTPException(status_code=400, detail="Folder already exists")
    new_folder = Folder(name=folder.name)
    db.add(new_folder)
    db.commit()
    db.refresh(new_folder)
    return new_folder

@router.get("/folders", response_model=List[FolderSchema])
def list_folders(db: Session = Depends(get_db)):
    return db.query(Folder).all()

@router.delete("/folders/{folder_id}")
def delete_folder(folder_id: int, db: Session = Depends(get_db)):
    folder = db.query(Folder).filter(Folder.id == folder_id).first()
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    db.delete(folder)
    db.commit()
    return {"detail": "Folder and all test cases deleted"} 