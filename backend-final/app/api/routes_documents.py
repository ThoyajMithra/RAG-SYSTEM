import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import Document
from app.schemas import DocumentOut


router = APIRouter(prefix="/documents", tags=["documents"])


@router.get("", response_model=List[DocumentOut])
def list_documents(db: Session = Depends(get_db)):
    return db.query(Document).order_by(Document.uploaded_at.desc()).all()


@router.get("/{document_id}", response_model=DocumentOut)
def get_document(document_id: str, db: Session = Depends(get_db)):
    doc = db.query(Document).get(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc


@router.delete("/{document_id}")
def delete_document(document_id: str, db: Session = Depends(get_db)):
    doc = db.query(Document).get(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # remove file from disk
    if os.path.exists(doc.file_path):
        os.remove(doc.file_path)


    db.delete(doc)  # chunks cascade-delete via relationship
    db.commit()
    return {"status": "deleted", "document_id": document_id}
