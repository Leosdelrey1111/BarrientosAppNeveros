from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app import db
from app.models.sale import Sale, SaleItem
from app.models.product import Product, InventoryMovement
from app.utils.auth import roles_required, get_current_user_id

sales_bp = Blueprint("sales", __name__)


@sales_bp.post("/")
@roles_required("admin", "cajero")
def create_sale():
    data  = request.get_json(silent=True) or {}
    items = data.get("items", [])

    if not items:
        return jsonify({"error": "La venta debe incluir al menos un producto"}), 400

    # Validar items y calcular total
    total = 0
    validated_items = []

    for item in items:
        product = Product.query.filter_by(id=item.get("product_id"), is_active=True).first()
        if not product:
            return jsonify({"error": f"Producto {item.get('product_id')} no encontrado"}), 404

        qty = int(item.get("quantity", 0))
        if qty <= 0:
            return jsonify({"error": f"Cantidad inválida para {product.name}"}), 400
        if product.stock < qty:
            return jsonify({"error": f"Stock insuficiente para {product.name} (disponible: {product.stock})"}), 400

        subtotal = float(product.price) * qty
        total   += subtotal
        validated_items.append((product, qty, float(product.price), subtotal))

    paid   = float(data.get("paid", 0))
    change = paid - total

    if paid < total:
        return jsonify({"error": f"Pago insuficiente. Total: ${total:.2f}"}), 400

    # Crear venta
    sale = Sale(
        cashier_id     = get_current_user_id(),
        total          = round(total, 2),
        paid           = round(paid, 2),
        change         = round(change, 2),
        payment_method = data.get("payment_method", "efectivo"),
        notes          = data.get("notes"),
    )
    db.session.add(sale)
    db.session.flush()  # Obtener sale.id antes de commit

    for product, qty, unit_price, subtotal in validated_items:
        # SaleItem
        sale_item = SaleItem(
            sale_id    = sale.id,
            product_id = product.id,
            quantity   = qty,
            unit_price = unit_price,
            subtotal   = subtotal,
        )
        db.session.add(sale_item)

        # Descontar stock
        product.stock -= qty

        # Movimiento de inventario
        movement = InventoryMovement(
            product_id = product.id,
            user_id    = get_current_user_id(),
            type       = "venta",
            quantity   = -qty,
            notes      = f"Venta #{sale.id}",
        )
        db.session.add(movement)

    db.session.commit()
    return jsonify(sale.to_dict(include_items=True)), 201


@sales_bp.get("/")
@roles_required("admin", "consultor")
def get_sales():
    page     = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 20))

    pagination = (
        Sale.query
        .order_by(Sale.created_at.desc())
        .paginate(page=page, per_page=per_page, error_out=False)
    )

    return jsonify({
        "sales":      [s.to_dict() for s in pagination.items],
        "total":      pagination.total,
        "page":       page,
        "per_page":   per_page,
        "pages":      pagination.pages,
    }), 200


@sales_bp.get("/<int:sale_id>")
@roles_required("admin", "consultor")
def get_sale(sale_id):
    sale = Sale.query.get_or_404(sale_id)
    return jsonify(sale.to_dict(include_items=True)), 200
