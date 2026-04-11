import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

_UNSAFE_SECRETS = {"dev-secret-change-in-production", "jwt-secret-change-in-production", ""}


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-in-production")
    DEBUG      = False
    TESTING    = False

    # ── Base de Datos ──────────────────────────────────────────────────
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = os.getenv("DB_PORT", "3306")
    DB_NAME = os.getenv("DB_NAME", "neveriapos")
    DB_USER = os.getenv("DB_USER", "root")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "123456")

    SQLALCHEMY_DATABASE_URI = (
        f"mysql+pymysql://"
        f"{os.getenv('DB_USER', 'root')}:{os.getenv('DB_PASSWORD', '')}"
        f"@{os.getenv('DB_HOST', 'localhost')}:{os.getenv('DB_PORT', '3306')}"
        f"/{os.getenv('DB_NAME', 'neveriapos')}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {"pool_recycle": 300, "pool_pre_ping": True}

    # JWT
    JWT_SECRET_KEY            = os.getenv("JWT_SECRET_KEY", "jwt-secret-change-in-production")
    JWT_ACCESS_TOKEN_EXPIRES  = timedelta(seconds=int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES",  3600)))
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(seconds=int(os.getenv("JWT_REFRESH_TOKEN_EXPIRES", 2592000)))
    JWT_TOKEN_LOCATION        = ["headers"]
    JWT_HEADER_NAME           = "Authorization"
    JWT_HEADER_TYPE           = "Bearer"

    # Email
    MAIL_SERVER   = os.getenv("MAIL_SERVER", "smtp.gmail.com")
    MAIL_PORT     = int(os.getenv("MAIL_PORT", 587))
    MAIL_USE_TLS  = os.getenv("MAIL_USE_TLS", "True") == "True"
    MAIL_USERNAME = os.getenv("MAIL_USERNAME")
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")

    # CORS
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG         = False
    SQLALCHEMY_ECHO = False

    def __init__(self):
        if self.SECRET_KEY in _UNSAFE_SECRETS:
            raise RuntimeError("SECRET_KEY no puede ser el valor por defecto en producción")
        if self.JWT_SECRET_KEY in _UNSAFE_SECRETS:
            raise RuntimeError("JWT_SECRET_KEY no puede ser el valor por defecto en producción")


class TestingConfig(Config):
    TESTING                  = True
    SQLALCHEMY_DATABASE_URI  = "sqlite:///:memory:"
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(seconds=5)


_config_map = {
    "development": DevelopmentConfig,
    "production":  ProductionConfig,
    "testing":     TestingConfig,
}


def get_config():
    env = os.getenv("FLASK_ENV", "development")
    return _config_map.get(env, DevelopmentConfig)
