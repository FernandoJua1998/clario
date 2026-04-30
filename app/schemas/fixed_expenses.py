import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

CATEGORIES = Literal[
    "alimentacion",
    "transporte",
    "entretenimiento",
    "salud",
    "servicios",
    "ropa",
    "educacion",
    "viajes",
    "otro",
]


class FixedExpenseCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    amount: float = Field(..., gt=0)
    category: CATEGORIES
    due_day: int = Field(..., ge=1, le=31)


class FixedExpenseUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=100)
    amount: float | None = Field(None, gt=0)
    category: CATEGORIES | None = None
    due_day: int | None = Field(None, ge=1, le=31)
    is_active: bool | None = None


class FixedExpenseResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    name: str
    amount: float
    category: str
    due_day: int
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
