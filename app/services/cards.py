import uuid
from datetime import date

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.card import Card
from app.schemas.cards import CardCreate, CardUpdate


def get_cards(db: Session, user_id: uuid.UUID) -> list[Card]:
    return (
        db.query(Card)
        .filter(Card.user_id == user_id, Card.is_active == True)  # noqa: E712
        .order_by(Card.created_at)
        .all()
    )


def get_card(db: Session, card_id: uuid.UUID, user_id: uuid.UUID) -> Card:
    card = db.query(Card).filter(Card.id == card_id, Card.user_id == user_id).first()
    if not card:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tarjeta no encontrada")
    return card


def create_card(db: Session, data: CardCreate, user_id: uuid.UUID) -> Card:
    balance_date: date | None = None
    if data.current_balance > 0:
        balance_date = date.today()

    card = Card(
        user_id=user_id,
        name=data.name,
        type=data.type,
        credit_limit=data.credit_limit,
        closing_day=data.closing_day,
        due_day=data.due_day,
        color=data.color,
        current_balance=data.current_balance,
        balance_date=balance_date,
    )
    db.add(card)
    db.commit()
    db.refresh(card)
    return card


def update_card(db: Session, card_id: uuid.UUID, data: CardUpdate, user_id: uuid.UUID) -> Card:
    card = get_card(db, card_id, user_id)

    update_data = data.model_dump(exclude_unset=True)

    # Si se actualiza current_balance > 0, registrar la fecha
    if "current_balance" in update_data and update_data["current_balance"] > 0:
        update_data["balance_date"] = date.today()

    for field, value in update_data.items():
        setattr(card, field, value)

    db.commit()
    db.refresh(card)
    return card


def delete_card(db: Session, card_id: uuid.UUID, user_id: uuid.UUID) -> None:
    card = get_card(db, card_id, user_id)
    # Soft delete: marcar como inactiva en lugar de borrar para preservar historial de gastos
    card.is_active = False
    db.commit()
