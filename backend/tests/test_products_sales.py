from app.models.product import Product
from app import db as _db


def test_create_product_as_admin(client, admin_token):
    r = client.post("/api/products/", json={
        "name": "Paleta de Prueba",
        "category": "Paletas",
        "price": 18,
        "stock": 30,
        "emoji": "🍓"
    }, headers={"Authorization": f"Bearer {admin_token}"})
    assert r.status_code == 201
    data = r.get_json()
    assert data["name"] == "Paleta de Prueba"
    assert data["price"] == 18.0


def test_create_product_as_cajero_forbidden(client, cajero_token):
    r = client.post("/api/products/", json={
        "name": "Intento no permitido",
        "category": "Helados",
        "price": 25,
    }, headers={"Authorization": f"Bearer {cajero_token}"})
    assert r.status_code == 403


def test_get_products(client, cajero_token):
    r = client.get("/api/products/", headers={"Authorization": f"Bearer {cajero_token}"})
    assert r.status_code == 200
    assert isinstance(r.get_json(), list)


def test_create_sale(client, cajero_token, app):
    # Crear producto primero
    with app.app_context():
        p = Product(name="Helado Test", category="Helados", price=25, stock=10, emoji="🍦")
        _db.session.add(p)
        _db.session.commit()
        product_id = p.id

    r = client.post("/api/sales/", json={
        "items": [{"product_id": product_id, "quantity": 2}],
        "paid": 60,
        "payment_method": "efectivo"
    }, headers={"Authorization": f"Bearer {cajero_token}"})

    assert r.status_code == 201
    data = r.get_json()
    assert float(data["total"]) == 50.0
    assert float(data["change"]) == 10.0


def test_sale_insufficient_stock(client, cajero_token, app):
    with app.app_context():
        p = Product(name="Raspado Escaso", category="Raspados", price=20, stock=1, emoji="🧊")
        _db.session.add(p)
        _db.session.commit()
        product_id = p.id

    r = client.post("/api/sales/", json={
        "items": [{"product_id": product_id, "quantity": 99}],
        "paid": 9999,
    }, headers={"Authorization": f"Bearer {cajero_token}"})

    assert r.status_code == 400
