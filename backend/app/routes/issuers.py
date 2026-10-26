"""
Issuer sources router
Canonical location: app.routes.issuers
"""

from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.models import database_models as models
from app.models import schemas
from app.utils.database import get_db

router = APIRouter(prefix="/api/issuers", tags=["issuers"])


@router.get("", response_model=List[schemas.IssuerSourceOut])
def list_issuers(db: Session = Depends(get_db)):
    return db.query(models.IssuerSource).filter_by(is_active=True).all()
