from typing import Any

from pydantic import BaseSettings, PostgresDsn, validator


class Settings(BaseSettings):
    app_name: str = "Arcade Transaction System"

    PUBLIC_KEY: str
    PRIVATE_KEY: str

    POSTGRES_SERVER: str
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str | None

    POSTGRES_CLIENT_SERVER: str
    POSTGRES_CLIENT_USER: str
    POSTGRES_CLIENT_PASSWORD: str
    POSTGRES_CLIENT_DB: str

    POSTGRES_TEST_DB: str | None

    CLIENT_DB_URI: PostgresDsn | None = None

    DATABASE_URI: PostgresDsn | None = None
    TEST_DB_URI: PostgresDsn | None = None

    @validator("DATABASE_URI", pre=True)
    def assemble_db_connection(cls, v: str | None, values: dict[str, Any]) -> Any:
        if isinstance(v, str):
            return v
        return PostgresDsn.build(
            scheme="postgresql",
            user=values.get("POSTGRES_USER"),
            password=values.get("POSTGRES_PASSWORD"),
            host=values.get("POSTGRES_SERVER"),
            path=f"/{values.get('POSTGRES_DB') or ''}",
        )

    @validator("CLIENT_DB_URI", pre=True)
    def assemble_client_db_connection(
        cls, v: str | None, values: dict[str, Any]
    ) -> Any:
        if isinstance(v, str):
            return v
        return PostgresDsn.build(
            scheme="postgresql",
            user=values.get("POSTGRES_CLIENT_USER"),
            password=values.get("POSTGRES_CLIENT_PASSWORD"),
            host=values.get("POSTGRES_CLIENT_SERVER"),
            path=f"/{values.get('POSTGRES_CLIENT_DB')}",
        )

    @validator("TEST_DB_URI", pre=True)
    def assemble_test_db_con(cls, v: str | None, values: dict[str, Any]) -> Any:
        if isinstance(v, str):
            return v
        if not values.get("POSTGRES_TEST_DB"):
            return v

        return PostgresDsn.build(
            scheme="postgresql",
            user=values.get("POSTGRES_USER"),
            password=values.get("POSTGRES_PASSWORD"),
            host=values.get("POSTGRES_SERVER"),
            path=f"/{values.get('POSTGRES_TEST_DB')}",
        )

    class Config:
        env_file = ".env"


settings = Settings()
