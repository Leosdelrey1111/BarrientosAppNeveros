from flask import Blueprint, request, jsonify
from app import db
from app.models.user import User
from app.utils.auth import roles_required

users_bp = Blueprint("users", __name__)

@users_bp.get("/")
@roles_required("admin")
def get_users():
    return jsonify([u.to_dict() for u in User.query.order_by(User.name).all()]), 200

@users_bp.post("/")
@roles_required("admin")
def create_user():
    data = request.get_json(silent=True) or {}
    for field in ["name", "email", "password", "role"]:
        if not data.get(field):
            return jsonify({"error": f"Campo requerido: {field}"}), 400
    if User.query.filter_by(email=data["email"].lower()).first():
        return jsonify({"error": "El correo ya está registrado"}), 409
    if data["role"] not in ["admin", "cajero", "consultor"]:
        return jsonify({"error": "Rol inválido"}), 400
    user = User(name=data["name"].strip(), email=data["email"].strip().lower(), role=data["role"])
    user.set_password(data["password"])
    db.session.add(user)
    db.session.commit()
    return jsonify(user.to_dict()), 201

@users_bp.put("/<int:user_id>")
@roles_required("admin")
def update_user(user_id):
    user = User.query.get_or_404(user_id)
    data = request.get_json(silent=True) or {}
    if "name"      in data: user.name      = data["name"].strip()
    if "role"      in data: user.role      = data["role"]
    if "is_active" in data: user.is_active = bool(data["is_active"])
    if "password"  in data and data["password"]: user.set_password(data["password"])
    db.session.commit()
    return jsonify(user.to_dict()), 200
