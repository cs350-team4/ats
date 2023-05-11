from pydantic import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Arcade Transaction System"
    db_url: str

    class Config:
        env_file = ".env"
