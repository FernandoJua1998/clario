import uuid

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.fixed_expense import FixedExpense
from app.schemas.fixed_expenses import FixedExpenseCreate, FixedExpenseUpdate


def get_fixed_expenses(db: Session, user_id: uuid.UUID) -> list[FixedExpense]:
    return (
        db.query(FixedExpense)
        .filter(FixedExpense.user_id == user_id, FixedExpense.is_active == True)  # noqa: E712
        .order_by(FixedExpense.due_day)
        .all()
    )


def _get_or_404(db: Session, fixed_expense_id: uuid.UUID, user_id: uuid.UUID) -> FixedExpense:
    fe = (
        db.query(FixedExpense)
        .filter(FixedExpense.id == fixed_expense_id, FixedExpense.user_id == user_id)
        .first()
    )
    if not fe:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Gasto fijo no encontrado")
    return fe


def create_fixed_expense(db: Session, data: FixedExpenseCreate, user_id: uuid.UUID) -> FixedExpense:
    fe = FixedExpense(
        user_id=user_id,
        name=data.name,
        amount=data.amount,
        category=data.category,
        due_day=data.due_day,
    )
    db.add(fe)
    db.commit()
    db.refresh(fe)
    return fe


def update_fixed_expense(
    db: Session,
    fixed_expense_id: uuid.UUID,
    data: FixedExpenseUpdate,
    user_id: uuid.UUID,
) -> FixedExpense:
    fe = _get_or_404(db, fixed_expense_id, user_id)

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(fe, field, value)

    db.commit()
    db.refresh(fe)
    return fe


def delete_fixed_expense(db: Session, fixed_expense_id: uuid.UUID, user_id: uuid.UUID) -> None:
    fe = _get_or_404(db, fixed_expense_id, user_id)
    fe.is_active = False
    db.commit()
