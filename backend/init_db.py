"""Script para crear todas las tablas y cargar datos iniciales."""
from app import create_app, db
import app.models  # noqa - registra todos los modelos

flask_app = create_app()

with flask_app.app_context():
    print("Creando tablas...")
    db.create_all()
    print("Tablas creadas.")

    from app.models.user import User
    from app.models.product import Product

    USERS = [
        {"name": "Sofia Torres",   "email": "admin@neveria.mx",     "password": "admin123",     "role": "admin"},
        {"name": "Carlos Mendez",  "email": "cajero@neveria.mx",    "password": "cajero123",    "role": "cajero"},
        {"name": "Ana Lopez",      "email": "consultor@neveria.mx", "password": "consultor123", "role": "consultor"},
    ]

    PRODUCTS = [
        {"name": "Paleta de Fresa",    "category": "Paletas",  "price": 18, "stock": 42, "emoji": "🍓"},
        {"name": "Paleta de Mango",    "category": "Paletas",  "price": 18, "stock": 8,  "emoji": "🥭"},
        {"name": "Paleta de Coco",     "category": "Paletas",  "price": 18, "stock": 50, "emoji": "🥥"},
        {"name": "Paleta Mazapan",     "category": "Paletas",  "price": 22, "stock": 35, "emoji": "🎉"},
        {"name": "Helado de Vainilla", "category": "Helados",  "price": 25, "stock": 30, "emoji": "🍦"},
        {"name": "Helado Chocolate",   "category": "Helados",  "price": 25, "stock": 22, "emoji": "🍫"},
        {"name": "Sorbete de Limon",   "category": "Sorbetes", "price": 20, "stock": 25, "emoji": "🍋"},
        {"name": "Sorbete Melon",      "category": "Sorbetes", "price": 20, "stock": 14, "emoji": "🍈"},
        {"name": "Raspado Tamarindo",  "category": "Raspados", "price": 22, "stock": 3,  "emoji": "🧊"},
        {"name": "Raspado Jamaica",    "category": "Raspados", "price": 20, "stock": 18, "emoji": "🌺"},
    ]

    for u in USERS:
        if not User.query.filter_by(email=u["email"]).first():
            user = User(name=u["name"], email=u["email"], role=u["role"])
            user.set_password(u["password"])
            db.session.add(user)
            print(f"  Usuario creado: {u['email']}")
        else:
            print(f"  Ya existe: {u['email']}")

    for p in PRODUCTS:
        if not Product.query.filter_by(name=p["name"]).first():
            db.session.add(Product(**p))
            print(f"  Producto creado: {p['emoji']} {p['name']}")

    db.session.commit()
    print("\nListo. Puedes iniciar sesion con:")
    print("  admin@neveria.mx     / admin123")
    print("  cajero@neveria.mx    / cajero123")
    print("  consultor@neveria.mx / consultor123")
