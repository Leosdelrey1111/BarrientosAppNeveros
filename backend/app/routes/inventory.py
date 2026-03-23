from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app import db
from app.models.product import Product, InventoryMovement
from app.utils.auth import roles_required, get_current_user_id

inventory_bp = Blueprint("inventory", __name__)

@inventory_bp.get("/")
@jwt_required()
def get_inventory():
    products = Product.query.filter_by(is_active=True).order_by(Product.category).all()
    return jsonify([p.to_dict() for p in products]), 200

@inventory_bp.get("/low-stock")
@jwt_required()
def get_low_stock():
    products = Product.query.filter(
        Product.is_active == True,
        Product.stock <= Product.stock_alert
    ).all()
    return jsonify([p.to_dict() for p in products]), 200

@inventory_bp.post("/movement")
@roles_required("admin")
def register_movement():
    data = request.get_json(silent=True) or {}
    product = Product.query.get_or_404(data.get("product_id"))
    qty  = int(data.get("quantity", 0))
    mov_type = data.get("type", "entrada")
    if mov_type == "salida" and product.stock < qty:
        return jsonify({"error": "Stock insuficiente"}), 400
    if mov_type == "entrada":
        product.stock += qty
    elif mov_type == "salida":
        product.stock -= qty
    elif mov_type == "ajuste":
        product.stock = qty
    movement = InventoryMovement(
        product_id=product.id, user_id=get_current_user_id(),
        type=mov_type, quantity=qty, notes=data.get("notes"),
    )
    db.session.add(movement)
    db.session.commit()
    return jsonify({"product": product.to_dict(), "movement": movement.to_dict()}), 201

@inventory_bp.get("/movements")
@roles_required("admin")
def get_movements():
    product_id = request.args.get("product_id", type=int)
    q = InventoryMovement.query.order_by(InventoryMovement.created_at.desc())
    if product_id:
        q = q.filter_by(product_id=product_id)
    return jsonify([m.to_dict() for m in q.limit(100).all()]), 200
