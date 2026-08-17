"""Runtime configuration (env-driven)."""

from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="LUMINA_", env_file=".env")

    # Storage
    database_url: str = "postgresql+psycopg://lumina:lumina@localhost:5432/lumina"
    redis_url: str = "redis://localhost:6379/0"

    # Crawler credentials / endpoints
    reliefweb_appname: str = "lumina-impact"
    google_cse_api_key: str = ""
    google_cse_engine_id: str = ""

    # UNSPSC codes of interest
    unspsc_cinematography: str = "82131600"
    unspsc_photography: str = "82130000"

    # Notifications / dispatch
    dispatch_email: str = "hello@storitellah.com"
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""

    # Digest schedule (EAT)
    daily_digest_hour_eat: int = 8


settings = Settings()
