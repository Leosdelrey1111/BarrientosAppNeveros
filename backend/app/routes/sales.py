from flask import Blueprint, request
from marshmallow import ValidationError

from app.schemas import SaleSchema
from app.models.sale import Sale
from app.services import SaleService
from app.utils.auth import roles_required, get_current_user_id
from app.utils.responses import success, created, error, paginated

sales_bp = Blueprint("sales", __name__)

_sale_schema = SaleSchema()


@sales_bp.post("/")
@roles_required("admin", "cajero")
def create_sale():
    try:
        data = _sale_schema.load(request.get_json(silent=True) or {})
    except ValidationError as e:
        return error("Datos inválidos", details=e.messages)

    try:
        sale = SaleService.create(
            cashier_id     = get_current_user_id(),
            items          = data["items"],
            paid           = data["paid"],
            payment_method = data["payment_method"],
            notes          = data.get("notes"),
        )
    except ValueError as e:
        return error(str(e))

    return created(sale.to_dict(include_items=True))


@sales_bp.get("/")
@roles_required("admin", "consultor")
def get_sales():
    page     = request.args.get("page",     1,  type=int)
    per_page = request.args.get("per_page", 20, type=int)

    pagination = Sale.query.order_by(Sale.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    return paginated(pagination.items, pagination, serializer=lambda s: s.to_dict())


@sales_bp.get("/<int:sale_id>")
@roles_required("admin", "consultor")
def get_sale(sale_id):
    sale = Sale.query.get_or_404(sale_id)
    return success(sale.to_dict(include_items=True))
