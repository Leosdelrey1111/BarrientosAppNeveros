from flask import Blueprint, request, current_app
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity, get_jwt,
)
from flask_mail import Message
from marshmallow import ValidationError

from app import db, mail
from app.models.user import User
from app.schemas import LoginSchema, ResetPasswordSchema
from app.utils.responses import success, error, created

auth_bp = Blueprint("auth", __name__)

_revoked_tokens: set = set()
_login_schema         = LoginSchema()
_reset_schema         = ResetPasswordSchema()


def _make_tokens(user: User):
    claims = {"role": user.role, "name": user.name}
    return (
        create_access_token(identity=str(user.id),  additional_claims=claims),
        create_refresh_token(identity=str(user.id), additional_claims=claims),
    )


def is_token_revoked(jwt_header, jwt_data):
    return jwt_data["jti"] in _revoked_tokens


@auth_bp.post("/login")
def login():
    try:
        data = _login_schema.load(request.get_json(silent=True) or {})
    except ValidationError as e:
        return error("Datos inválidos", details=e.messages)

    user = User.query.filter_by(email=data["email"].lower(), is_active=True).first()
    if not user or not user.check_password(data["password"]):
        return error("Credenciales incorrectas", 401)

    access_token, refresh_token = _make_tokens(user)
    return success({"access_token": access_token, "refresh_token": refresh_token, "user": user.to_dict()})


@auth_bp.post("/refresh")
@jwt_required(refresh=True)
def refresh():
    user = User.query.get_or_404(int(get_jwt_identity()))
    access_token, _ = _make_tokens(user)
    return success({"access_token": access_token})


@auth_bp.post("/logout")
@jwt_required()
def logout():
    _revoked_tokens.add(get_jwt()["jti"])
    return success({"message": "Sesión cerrada exitosamente"})


@auth_bp.get("/me")
@jwt_required()
def me():
    user = User.query.get_or_404(int(get_jwt_identity()))
    return success(user.to_dict())


@auth_bp.post("/forgot-password")
def forgot_password():
    data  = request.get_json(silent=True) or {}
    email = data.get("email", "").strip().lower()
    user  = User.query.filter_by(email=email, is_active=True).first()

    if user:
        from itsdangerous import URLSafeTimedSerializer
        s         = URLSafeTimedSerializer(current_app.config["SECRET_KEY"])
        token     = s.dumps(email, salt="password-reset")
        reset_url = f"{current_app.config['FRONTEND_URL']}/reset-password?token={token}"
        _send_reset_email(user.name, email, reset_url)

    return success({"message": "Si el correo existe, recibirás instrucciones en breve."})


@auth_bp.post("/reset-password")
def reset_password():
    try:
        data = _reset_schema.load(request.get_json(silent=True) or {})
    except ValidationError as e:
        return error("Datos inválidos", details=e.messages)

    from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadSignature
    s = URLSafeTimedSerializer(current_app.config["SECRET_KEY"])
    try:
        email = s.loads(data["token"], salt="password-reset", max_age=3600)
    except SignatureExpired:
        return error("El token ha expirado")
    except BadSignature:
        return error("Token inválido")

    user = User.query.filter_by(email=email).first()
    if not user:
        return error("Usuario no encontrado", 404)

    user.set_password(data["password"])
    db.session.commit()
    return success({"message": "Contraseña restablecida exitosamente"})


def _send_reset_email(name: str, to_email: str, reset_url: str):
    body = (
        f"Hola {name},\n\n"
        "Recibimos una solicitud para restablecer tu contraseña en NeveriaPOS.\n\n"
        f"Enlace válido por 1 hora:\n{reset_url}\n\n"
        "Si no solicitaste esto, ignora este correo.\n\n"
        "-- Equipo NeveriaPOS"
    )
    msg = Message(
        subject="Restablecer contraseña - NeveriaPOS",
        sender=current_app.config["MAIL_USERNAME"],
        recipients=[to_email],
        body=body,
    )
    try:
        mail.send(msg)
    except Exception as e:
        current_app.logger.error(f"Error enviando correo a {to_email}: {e}")
