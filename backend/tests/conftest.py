# conftest.py - fixtures compartidas para todos los tests
import pytest
from app import create_app, db as _db
from config import TestingConfig


@pytest.fixture(scope="session")
def app():
    app = create_app(TestingConfig)
    with app.app_context():
        _db.create_all()
        yield app
        _db.drop_all()


@pytest.fixture(scope="function")
def db(app):
    """BD limpia para cada test."""
    with app.app_context():
        yield _db
        _db.session.rollback()


@pytest.fixture(scope="function")
def client(app):
    return app.test_client()


@pytest.fixture
def admin_token(client, db):
    """Crea un admin y retorna su JWT."""
    from app.models.user import User
    u = User(name="Admin Test", email="admintest@test.com", role="admin")
    u.set_password("test123")
    db.session.add(u)
    db.session.commit()
    r = client.post("/api/auth/login", json={"email": "admintest@test.com", "password": "test123"})
    return r.get_json()["access_token"]


@pytest.fixture
def cajero_token(client, db):
    from app.models.user import User
    u = User(name="Cajero Test", email="cajerotest@test.com", role="cajero")
    u.set_password("test123")
    db.session.add(u)
    db.session.commit()
    r = client.post("/api/auth/login", json={"email": "cajerotest@test.com", "password": "test123"})
    return r.get_json()["access_token"]
