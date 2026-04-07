from flask import jsonify


def success(data, status=200):
    return jsonify(data), status


def created(data):
    return jsonify(data), 201


def error(message, status=400, details=None):
    body = {"error": message}
    if details:
        body["details"] = details
    return jsonify(body), status


def not_found(resource="Recurso"):
    return error(f"{resource} no encontrado", 404)


def forbidden(roles=None):
    msg = "Acceso denegado"
    if roles:
        msg += f". Roles permitidos: {', '.join(roles)}"
    return error(msg, 403)


def paginated(items, pagination, serializer=None):
    return jsonify({
        "data":     [serializer(i) for i in items] if serializer else items,
        "total":    pagination.total,
        "page":     pagination.page,
        "per_page": pagination.per_page,
        "pages":    pagination.pages,
    }), 200
