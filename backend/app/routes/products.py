from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from marshmallow import ValidationError

from app import db
from app.models.product import Product
from app.schemas import ProductSchema, ProductUpdateSchema
from app.utils.auth import roles_required
from app.utils.responses import success, created, error
from app.utils.s3 import upload_image, delete_image

products_bp = Blueprint("products", __name__)

_create_schema = ProductSchema()
_update_schema = ProductUpdateSchema()


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

    return success([p.to_dict() for p in q.order_by(Product.category, Product.name).all()])


@products_bp.get("/<int:product_id>")
@jwt_required()
def get_product(product_id):
    product = Product.query.get_or_404(product_id)
    return success(product.to_dict())


@products_bp.post("/")
@roles_required("admin")
def create_product():
    try:
        data = _create_schema.load(request.get_json(silent=True) or {})
    except ValidationError as e:
        return error("Datos inválidos", details=e.messages)

    product = Product(**data)
    db.session.add(product)
    db.session.commit()
    return created(product.to_dict())


@products_bp.put("/<int:product_id>")
@roles_required("admin")
def update_product(product_id):
    product = Product.query.get_or_404(product_id)
    try:
        data = _update_schema.load(request.get_json(silent=True) or {})
    except ValidationError as e:
        return error("Datos inválidos", details=e.messages)

    for field, value in data.items():
        setattr(product, field, value)

    db.session.commit()
    return success(product.to_dict())


@products_bp.delete("/<int:product_id>")
@roles_required("admin")
def delete_product(product_id):
    product = Product.query.get_or_404(product_id)
    product.is_active = False
    db.session.commit()
    return success({"message": "Producto desactivado"})


@products_bp.post("/<int:product_id>/image")
@roles_required("admin")
def upload_product_image(product_id):
    product = Product.query.get_or_404(product_id)
    file    = request.files.get("image")
    if not file:
        return error("No se recibió ningún archivo")
    allowed = {"jpg", "jpeg", "png", "webp"}
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in allowed:
        return error("Formato no permitido. Usa JPG, PNG o WEBP")
    if product.image_url:
        delete_image(product.image_url)
    try:
        url = upload_image(file)
    except Exception as e:
        return error(f"Error al subir imagen: {str(e)}", 500)
    product.image_url = url
    db.session.commit()
    return success({"image_url": url})
