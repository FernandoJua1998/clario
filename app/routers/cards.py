import uuid

from fastapi import APIRouter, Depends, status
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.cards import CardCreate, CardResponse, CardUpdate
from app.services.auth import get_current_user
from app.services import cards as card_service

router = APIRouter(prefix="/cards", tags=["cards"])


@router.get("", response_model=list[CardResponse])
def list_cards(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return card_service.get_cards(db, current_user.id)


@router.post("", response_model=CardResponse, status_code=status.HTTP_201_CREATED)
def create_card(
    data: CardCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return card_service.create_card(db, data, current_user.id)


@router.patch("/{card_id}", response_model=CardResponse)
def update_card(
    card_id: uuid.UUID,
    data: CardUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return card_service.update_card(db, card_id, data, current_user.id)


@router.delete("/{card_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_card(
    card_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Response:
    card_service.delete_card(db, card_id, current_user.id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
