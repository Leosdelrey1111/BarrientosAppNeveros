from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt


def roles_required(*roles):
    """
    Decorador RBAC: protege un endpoint verificando JWT y rol del usuario.

    Uso:
        @roles_required("admin")
        @roles_required("admin", "cajero")
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            user_role = claims.get("role")

            if user_role not in roles:
                return jsonify({
                    "error": "Acceso denegado",
                    "message": f"Se requiere uno de estos roles: {', '.join(roles)}"
                }), 403

            return fn(*args, **kwargs)
        return wrapper
    return decorator


def get_current_user_id() -> int:
    """Obtiene el ID del usuario del JWT actual."""
    from flask_jwt_extended import get_jwt_identity
    return get_jwt_identity()


def get_current_user_role() -> str:
    """Obtiene el rol del usuario del JWT actual."""
    return get_jwt().get("role")
