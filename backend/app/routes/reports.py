from flask import Blueprint, request, jsonify
from sqlalchemy import func
from app import db
from app.models.product import Product
from app.models.sale import Sale, SaleItem
from app.utils.auth import roles_required

reports_bp = Blueprint("reports", __name__)

@reports_bp.get("/summary")
@roles_required("admin", "consultor")
def summary():
    from datetime import date, timedelta
    today = date.today()
    yesterday = today - timedelta(days=1)
    sales_today = db.session.query(
        func.count(Sale.id).label("count"),
        func.coalesce(func.sum(Sale.total), 0).label("total"),
    ).filter(func.date(Sale.created_at) == today).one()
    sales_yesterday = db.session.query(
        func.coalesce(func.sum(Sale.total), 0).label("total"),
    ).filter(func.date(Sale.created_at) == yesterday).one()
    items_today = db.session.query(
        func.coalesce(func.sum(SaleItem.quantity), 0)
    ).join(Sale).filter(func.date(Sale.created_at) == today).scalar() or 0
    low_stock_count = Product.query.filter(
        Product.is_active == True, Product.stock <= Product.stock_alert
    ).count()
    return jsonify({
        "sales_today": float(sales_today.total),
        "transactions_today": int(sales_today.count),
        "items_today": int(items_today),
        "low_stock_count": low_stock_count,
        "sales_yesterday": float(sales_yesterday.total),
    }), 200

@reports_bp.get("/sales-by-day")
@roles_required("admin", "consultor")
def sales_by_day():
    from datetime import date, timedelta
    days = int(request.args.get("days", 7))
    result = []
    for i in range(days - 1, -1, -1):
        d = date.today() - timedelta(days=i)
        total = db.session.query(func.coalesce(func.sum(Sale.total), 0)).filter(
            func.date(Sale.created_at) == d
        ).scalar()
        result.append({"date": d.isoformat(), "total": float(total)})
    return jsonify(result), 200

@reports_bp.get("/top-products")
@roles_required("admin", "consultor")
def top_products():
    rows = (
        db.session.query(
            Product.name, Product.emoji,
            func.sum(SaleItem.quantity).label("units_sold"),
            func.sum(SaleItem.subtotal).label("revenue"),
        )
        .join(SaleItem, SaleItem.product_id == Product.id)
        .group_by(Product.id)
        .order_by(func.sum(SaleItem.quantity).desc())
        .limit(10).all()
    )
    return jsonify([
        {"name": r.name, "emoji": r.emoji, "units_sold": int(r.units_sold), "revenue": float(r.revenue)}
        for r in rows
    ]), 200
