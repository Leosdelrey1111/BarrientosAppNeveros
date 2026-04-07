from flask import Blueprint, request
from marshmallow import ValidationError

from app import db
from app.models.user import User
from app.schemas import UserCreateSchema, UserUpdateSchema
from app.utils.auth import roles_required
from app.utils.responses import success, created, error

users_bp = Blueprint("users", __name__)

_create_schema = UserCreateSchema()
_update_schema = UserUpdateSchema()


@users_bp.get("/")
@roles_required("admin")
def get_users():
    return success([u.to_dict() for u in User.query.order_by(User.name).all()])


@users_bp.post("/")
@roles_required("admin")
def create_user():
    try:
        data = _create_schema.load(request.get_json(silent=True) or {})
    except ValidationError as e:
        return error("Datos inválidos", details=e.messages)

    if User.query.filter_by(email=data["email"].lower()).first():
        return error("El correo ya está registrado", 409)

    user = User(name=data["name"].strip(), email=data["email"].lower(), role=data["role"])
    user.set_password(data["password"])
    db.session.add(user)
    db.session.commit()
    return created(user.to_dict())


@users_bp.put("/<int:user_id>")
@roles_required("admin")
def update_user(user_id):
    user = User.query.get_or_404(user_id)
    try:
        data = _update_schema.load(request.get_json(silent=True) or {})
    except ValidationError as e:
        return error("Datos inválidos", details=e.messages)

    password = data.pop("password", None)
    for field, value in data.items():
        setattr(user, field, value)
    if password:
        user.set_password(password)

    db.session.commit()
    return success(user.to_dict())
