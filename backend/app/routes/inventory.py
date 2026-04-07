from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from marshmallow import ValidationError

from app.models.product import Product, InventoryMovement
from app.schemas import MovementSchema
from app.services import InventoryService
from app.utils.auth import roles_required, get_current_user_id
from app.utils.responses import success, created, error

inventory_bp = Blueprint("inventory", __name__)

_movement_schema = MovementSchema()


@inventory_bp.get("/")
@jwt_required()
def get_inventory():
    products = Product.query.filter_by(is_active=True).order_by(Product.category).all()
    return success([p.to_dict() for p in products])


@inventory_bp.get("/low-stock")
@jwt_required()
def get_low_stock():
    products = Product.query.filter(
        Product.is_active == True,
        Product.stock <= Product.stock_alert,
    ).all()
    return success([p.to_dict() for p in products])


@inventory_bp.post("/movement")
@roles_required("admin")
def register_movement():
    try:
        data = _movement_schema.load(request.get_json(silent=True) or {})
    except ValidationError as e:
        return error("Datos inválidos", details=e.messages)

    product = Product.query.get_or_404(data["product_id"])

    try:
        movement = InventoryService.register_movement(
            product  = product,
            user_id  = get_current_user_id(),
            mov_type = data["type"],
            quantity = data["quantity"],
            notes    = data.get("notes"),
        )
    except ValueError as e:
        return error(str(e))

    return created({"product": product.to_dict(), "movement": movement.to_dict()})


@inventory_bp.get("/movements")
@roles_required("admin")
def get_movements():
    product_id = request.args.get("product_id", type=int)
    q = InventoryMovement.query.order_by(InventoryMovement.created_at.desc())
    if product_id:
        q = q.filter_by(product_id=product_id)
    return success([m.to_dict() for m in q.limit(100).all()])
