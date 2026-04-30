from pathlib import Path

from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

# Carga explícita del .env desde la raíz del proyecto, útil cuando el proceso
# arranca desde un directorio distinto (e.g. alembic, uvicorn desde subdirectorio).
_env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(_env_path, override=False)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=str(_env_path), env_file_encoding="utf-8")

    database_url: str
    anthropic_api_key: str
    supabase_url: str
    supabase_anon_key: str
    supabase_service_role_key: str
    resend_api_key: str
    frontend_url: str = "http://localhost:5173"


settings = Settings()
