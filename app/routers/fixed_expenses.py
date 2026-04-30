import uuid

from fastapi import APIRouter, Depends, status
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.fixed_expenses import FixedExpenseCreate, FixedExpenseResponse, FixedExpenseUpdate
from app.services.auth import get_current_user
from app.services import fixed_expenses as fe_service

router = APIRouter(prefix="/fixed-expenses", tags=["fixed-expenses"])


@router.get("", response_model=list[FixedExpenseResponse])
def list_fixed_expenses(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return fe_service.get_fixed_expenses(db, current_user.id)


@router.post("", response_model=FixedExpenseResponse, status_code=status.HTTP_201_CREATED)
def create_fixed_expense(
    data: FixedExpenseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return fe_service.create_fixed_expense(db, data, current_user.id)


@router.patch("/{fixed_expense_id}", response_model=FixedExpenseResponse)
def update_fixed_expense(
    fixed_expense_id: uuid.UUID,
    data: FixedExpenseUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return fe_service.update_fixed_expense(db, fixed_expense_id, data, current_user.id)


@router.delete("/{fixed_expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_fixed_expense(
    fixed_expense_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Response:
    fe_service.delete_fixed_expense(db, fixed_expense_id, current_user.id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
