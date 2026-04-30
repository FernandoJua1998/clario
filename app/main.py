from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import auth, cards, fixed_expenses

app = FastAPI(
    title="Clarío API",
    description="API para control financiero personal con cálculo MSI",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(cards.router)
app.include_router(fixed_expenses.router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "clario-api"}
