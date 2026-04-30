import uuid
from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, Field, field_validator


class CardCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    type: Literal["credit", "debit"]
    credit_limit: float | None = Field(None, gt=0)
    closing_day: int | None = Field(None, ge=1, le=31)
    due_day: int | None = Field(None, ge=1, le=31)
    color: str = Field(..., pattern=r"^#[0-9A-Fa-f]{6}$")
    current_balance: float = Field(0.00, ge=0)

    @field_validator("credit_limit")
    @classmethod
    def credit_limit_only_for_credit(cls, v: float | None, info) -> float | None:
        if info.data.get("type") == "debit" and v is not None:
            raise ValueError("Las tarjetas de débito no tienen límite de crédito")
        return v


class CardUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=100)
    credit_limit: float | None = Field(None, gt=0)
    closing_day: int | None = Field(None, ge=1, le=31)
    due_day: int | None = Field(None, ge=1, le=31)
    color: str | None = Field(None, pattern=r"^#[0-9A-Fa-f]{6}$")
    current_balance: float | None = Field(None, ge=0)
    is_active: bool | None = None


class CardResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    name: str
    type: str
    credit_limit: float | None
    closing_day: int | None
    due_day: int | None
    color: str
    current_balance: float
    balance_date: date | None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
