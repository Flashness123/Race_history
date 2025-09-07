from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+psycopg://postgres:postgres@localhost:5432/longboard"
    JWT_SECRET: str = "change-me"
    JWT_ALG: str = "HS256"

    class Config:
        env_file = ".env"

settings = Settings()
