import os
from pydantic_settings import BaseSettings
from typing import List

_IS_VERCEL = bool(os.environ.get("VERCEL"))
_DEFAULT_DB = "sqlite:////tmp/certiproof.db" if _IS_VERCEL else "sqlite:///./certiproof.db"
_DEFAULT_SCREENSHOTS = "/tmp/screenshots" if _IS_VERCEL else "./screenshots"


class Settings(BaseSettings):
    APP_ENV: str = "production" if _IS_VERCEL else "development"
    APP_SECRET_KEY: str = "dev-secret"
    CORS_ORIGINS: str = "*"
    DATABASE_URL: str = _DEFAULT_DB
    SCREENSHOTS_DIR: str = _DEFAULT_SCREENSHOTS
    PLAYWRIGHT_HEADLESS: int = 1
    MAX_REQUESTS_PER_MINUTE: int = 60

    @property
    def cors_origins_list(self) -> List[str]:
        if self.CORS_ORIGINS.strip() == "*":
            return ["*"]
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()

