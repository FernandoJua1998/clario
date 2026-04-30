from fastapi import APIRouter, Depends

from app.models.user import User
from app.services.auth import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/me")
def me(current_user: User = Depends(get_current_user)):
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "name": current_user.name,
        "plan": current_user.plan,
        "currency": current_user.currency,
        "monthly_income": current_user.monthly_income,
    }
