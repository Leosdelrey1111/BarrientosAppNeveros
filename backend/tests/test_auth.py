import pytest
from app import create_app, db
from config import TestingConfig


@pytest.fixture
def app():
    app = create_app(TestingConfig)
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


def test_health(client):
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.get_json()["status"] == "ok"


def test_login_invalid(client):
    r = client.post("/api/auth/login", json={"email": "x@x.com", "password": "wrong"})
    assert r.status_code == 401


def test_login_success(client, app):
    from app.models.user import User
    with app.app_context():
        u = User(name="Test", email="test@test.com", role="cajero")
        u.set_password("pass123")
        db.session.add(u)
        db.session.commit()

    r = client.post("/api/auth/login", json={"email": "test@test.com", "password": "pass123"})
    assert r.status_code == 200
    data = r.get_json()
    assert "access_token" in data
    assert data["user"]["role"] == "cajero"


def test_protected_route_no_token(client):
    r = client.get("/api/products/")
    assert r.status_code == 401
