import click
from flask import Flask
from app import db
from app.models import User, Product


SEED_USERS = [
    {"name": "Sofía Torres",         "email": "admin@neveria.mx",     "password": "admin123",     "role": "admin"},
    {"name": "Carlos Méndez",        "email": "cajero@neveria.mx",    "password": "cajero123",    "role": "cajero"},
    {"name": "Ana López",            "email": "consultor@neveria.mx", "password": "consultor123", "role": "consultor"},
]

SEED_PRODUCTS = [
    {"name": "Paleta de Fresa",    "category": "Paletas",  "price": 18, "stock": 42, "emoji": "🍓"},
    {"name": "Paleta de Mango",    "category": "Paletas",  "price": 18, "stock": 8,  "emoji": "🥭"},
    {"name": "Paleta de Coco",     "category": "Paletas",  "price": 18, "stock": 50, "emoji": "🥥"},
    {"name": "Paleta Mazapán",     "category": "Paletas",  "price": 22, "stock": 35, "emoji": "🎉"},
    {"name": "Helado de Vainilla", "category": "Helados",  "price": 25, "stock": 30, "emoji": "🍦"},
    {"name": "Helado Chocolate",   "category": "Helados",  "price": 25, "stock": 22, "emoji": "🍫"},
    {"name": "Sorbete de Limón",   "category": "Sorbetes", "price": 20, "stock": 25, "emoji": "🍋"},
    {"name": "Sorbete Melón",      "category": "Sorbetes", "price": 20, "stock": 14, "emoji": "🍈"},
    {"name": "Raspado Tamarindo",  "category": "Raspados", "price": 22, "stock": 3,  "emoji": "🧊"},
    {"name": "Raspado Jamaica",    "category": "Raspados", "price": 20, "stock": 18, "emoji": "🌺"},
]


def register_seed_command(app: Flask):
    @app.cli.command("seed-db")
    def seed_db():
        """Carga datos iniciales de prueba en la base de datos."""
        click.echo("🌱 Iniciando seed...")

        # Usuarios
        for u in SEED_USERS:
            if not User.query.filter_by(email=u["email"]).first():
                user = User(name=u["name"], email=u["email"], role=u["role"])
                user.set_password(u["password"])
                db.session.add(user)
                click.echo(f"   ✅ Usuario: {u['email']} [{u['role']}]")
            else:
                click.echo(f"   ⏭️  Ya existe: {u['email']}")

        # Productos
        for p in SEED_PRODUCTS:
            if not Product.query.filter_by(name=p["name"]).first():
                product = Product(**p)
                db.session.add(product)
                click.echo(f"   ✅ Producto: {p['emoji']} {p['name']}")

        db.session.commit()
        click.echo("🍦 Seed completado con éxito.")
