from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity, get_jwt,
)
from flask_mail import Message
from app import db, mail
from app.models.user import User

auth_bp = Blueprint("auth", __name__)

# Almacén simple de tokens revocados (en producción usa Redis)
_revoked_tokens: set = set()


@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    email    = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email y contraseña son requeridos"}), 400

    user = User.query.filter_by(email=email, is_active=True).first()

    if not user or not user.check_password(password):
        return jsonify({"error": "Credenciales incorrectas"}), 401

    additional_claims = {"role": user.role, "name": user.name}

    access_token  = create_access_token(identity=user.id, additional_claims=additional_claims)
    refresh_token = create_refresh_token(identity=user.id, additional_claims=additional_claims)

    return jsonify({
        "access_token":  access_token,
        "refresh_token": refresh_token,
        "user":          user.to_dict(),
    }), 200


@auth_bp.post("/refresh")
@jwt_required(refresh=True)
def refresh():
    user_id = get_jwt_identity()
    user    = User.query.get_or_404(user_id)

    additional_claims = {"role": user.role, "name": user.name}
    access_token = create_access_token(identity=user_id, additional_claims=additional_claims)

    return jsonify({"access_token": access_token}), 200


@auth_bp.post("/logout")
@jwt_required()
def logout():
    jti = get_jwt()["jti"]
    _revoked_tokens.add(jti)
    return jsonify({"message": "Sesión cerrada exitosamente"}), 200


@auth_bp.get("/me")
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user    = User.query.get_or_404(user_id)
    return jsonify(user.to_dict()), 200


@auth_bp.post("/forgot-password")
def forgot_password():
    """
    Envía un correo con token de un solo uso para restablecer contraseña.
    Implementación completa requiere Flask-Mail configurado en .env
    """
    data  = request.get_json(silent=True) or {}
    email = data.get("email", "").strip().lower()

    user = User.query.filter_by(email=email, is_active=True).first()

    if user:
        from itsdangerous import URLSafeTimedSerializer
        s     = URLSafeTimedSerializer(current_app.config["SECRET_KEY"])
        token = s.dumps(email, salt="password-reset")
        reset_url = f"{current_app.config['FRONTEND_URL']}/reset-password?token={token}"
        _send_reset_email(user.name, email, reset_url)

    return jsonify({"message": "Si el correo existe, recibirás instrucciones en breve."}), 200


def _send_reset_email(name: str, to_email: str, reset_url: str):
    body = (
        f"Hola {name},\n\n"
        "Recibimos una solicitud para restablecer tu contrasena en NeveriaPOS.\n\n"
        f"Haz clic en el siguiente enlace (valido por 1 hora):\n{reset_url}\n\n"
        "Si no solicitaste esto, ignora este correo.\n\n"
        "-- Equipo NeveriaPOS"
    )
    msg = Message(
        subject="Restablecer contrasena - NeveriaPOS",
        sender=current_app.config["MAIL_USERNAME"],
        recipients=[to_email],
        body=body,
    )
    try:
        mail.send(msg)
    except Exception as e:
        current_app.logger.error(f"Error enviando correo a {to_email}: {e}")


@auth_bp.post("/reset-password")
def reset_password():
    data     = request.get_json(silent=True) or {}
    token    = data.get("token", "")
    password = data.get("password", "")

    if not token or not password or len(password) < 6:
        return jsonify({"error": "Token y contraseña (mín. 6 chars) requeridos"}), 400

    from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadSignature
    from flask import current_app

    s = URLSafeTimedSerializer(current_app.config["SECRET_KEY"])
    try:
        email = s.loads(token, salt="password-reset", max_age=3600)
    except SignatureExpired:
        return jsonify({"error": "El token ha expirado"}), 400
    except BadSignature:
        return jsonify({"error": "Token inválido"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404

    user.set_password(password)
    db.session.commit()

    return jsonify({"message": "Contraseña restablecida exitosamente"}), 200
