import uuid
from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, Field, model_validator

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

MSI_OPTIONS = Literal[3, 6, 9, 12, 18]


class ExpenseCreate(BaseModel):
    amount: float = Field(..., gt=0)
    description: str = Field("", max_length=200)
    card_id: uuid.UUID | None = None
    category: CATEGORIES
    payment_type: Literal["contado", "msi"]
    msi_months: MSI_OPTIONS | None = None
    expense_date: date = Field(default_factory=date.today)

    @model_validator(mode="after")
    def validate_msi(self) -> "ExpenseCreate":
        if self.payment_type == "msi" and self.msi_months is None:
            raise ValueError("msi_months es requerido para pagos a MSI")
        if self.payment_type == "contado":
            self.msi_months = None
        return self


class ExpenseResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    card_id: uuid.UUID | None
    amount: float
    description: str
    category: str
    payment_type: str
    msi_months: int | None
    msi_start_date: date | None
    expense_date: date
    created_at: datetime

    model_config = {"from_attributes": True}
