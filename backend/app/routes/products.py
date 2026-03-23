from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app import db
from app.models.product import Product
from app.utils.auth import roles_required

products_bp = Blueprint("products", __name__)


@products_bp.get("/")
@jwt_required()
def get_products():
    category = request.args.get("category")
    search   = request.args.get("search", "")
    active   = request.args.get("active", "true").lower() == "true"

    q = Product.query.filter_by(is_active=active)
    if category:
        q = q.filter_by(category=category)
    if search:
        q = q.filter(Product.name.ilike(f"%{search}%"))

    products = q.order_by(Product.category, Product.name).all()
    return jsonify([p.to_dict() for p in products]), 200


@products_bp.get("/<int:product_id>")
@jwt_required()
def get_product(product_id):
    product = Product.query.get_or_404(product_id)
    return jsonify(product.to_dict()), 200


@products_bp.post("/")
@roles_required("admin")
def create_product():
    data = request.get_json(silent=True) or {}

    required = ["name", "category", "price"]
    for field in required:
        if not data.get(field):
            return jsonify({"error": f"Campo requerido: {field}"}), 400

    if data["category"] not in ["Paletas", "Helados", "Sorbetes", "Raspados"]:
        return jsonify({"error": "Categoría inválida"}), 400

    product = Product(
        name        = data["name"].strip(),
        category    = data["category"],
        price       = float(data["price"]),
        stock       = int(data.get("stock", 0)),
        stock_alert = int(data.get("stock_alert", 10)),
        emoji       = data.get("emoji", "🍦"),
    )
    db.session.add(product)
    db.session.commit()

    return jsonify(product.to_dict()), 201


@products_bp.put("/<int:product_id>")
@roles_required("admin")
def update_product(product_id):
    product = Product.query.get_or_404(product_id)
    data    = request.get_json(silent=True) or {}

    if "name"        in data: product.name        = data["name"].strip()
    if "category"    in data: product.category    = data["category"]
    if "price"       in data: product.price       = float(data["price"])
    if "stock"       in data: product.stock       = int(data["stock"])
    if "stock_alert" in data: product.stock_alert = int(data["stock_alert"])
    if "emoji"       in data: product.emoji       = data["emoji"]
    if "is_active"   in data: product.is_active   = bool(data["is_active"])

    db.session.commit()
    return jsonify(product.to_dict()), 200


@products_bp.delete("/<int:product_id>")
@roles_required("admin")
def delete_product(product_id):
    product = Product.query.get_or_404(product_id)
    product.is_active = False  # Soft delete
    db.session.commit()
    return jsonify({"message": "Producto desactivado"}), 200
