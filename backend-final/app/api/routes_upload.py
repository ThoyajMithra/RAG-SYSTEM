import os
import uuid

from fastapi import APIRouter, UploadFile, File, BackgroundTasks, Depends, HTTPException
from sqlalchemy.orm import Session
from pypdf import PdfReader

from app.models import Document
from app.services.ingestion import process_document
from app.services.transcription import AUDIO_EXTENSIONS
from app.schemas import UploadResponse
from app.database import get_db


from app.config import settings

router = APIRouter(prefix="/upload", tags=["upload"])

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt", ".md"} | AUDIO_EXTENSIONS

@router.post("",)
async def upload_file(
    background_tasks: BackgroundTasks,
    files :list[UploadFile]=File(...),
    db: Session = Depends(get_db),
):
    id=[]
    f_n=[]
    s=[]
    for file in files:
    
        ext=os.path.splitext(file.filename)[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type '{ext}'. Allowed: {ALLOWED_EXTENSIONS}",
            )
            
        os.makedirs(settings.STORAGE_DIR,exist_ok=True)

        sname=f'{uuid.uuid4()}{ext}'
        file_path=os.path.join(settings.STORAGE_DIR,sname)
        with open(file_path,"wb") as f:
            content=await file.read()
            f.write(content)

        doc = Document(
        filename=file.filename,
        file_path=file_path,
        content_type=file.content_type,
        status="processing",
        )
        db.add(doc)
        db.commit()
        db.refresh(doc)

        background_tasks.add_task(process_document,file_path,doc.id)

        id.append(doc.id)
        f_n.append(doc.filename)
        s.append(doc.status)

    return UploadResponse(document_ids=id, filenames=f_n, statuss=s)


    