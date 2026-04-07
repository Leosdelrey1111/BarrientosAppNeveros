from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_mail import Mail

from config import get_config

db      = SQLAlchemy()
migrate = Migrate()
jwt     = JWTManager()
bcrypt  = Bcrypt()
mail    = Mail()


def create_app(config_class=None):
    app = Flask(__name__)

    cfg = config_class or get_config()
    app.config.from_object(cfg)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    bcrypt.init_app(app)
    mail.init_app(app)

    CORS(app, resources={
        r"/api/*": {
            "origins":      [app.config["FRONTEND_URL"]],
            "methods":      ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
        }
    })

    _register_blueprints(app)
    _register_error_handlers(app)
    _register_jwt_callbacks(app)
    _run_pending_migrations(app)

    from app.utils.seed import register_seed_command
    register_seed_command(app)

    @app.get("/api/health")
    def health():
        return {"status": "ok", "service": "NeveriaPOS API", "version": "1.0.0"}

    return app


def _register_blueprints(app):
    from app.routes.auth      import auth_bp
    from app.routes.products  import products_bp
    from app.routes.inventory import inventory_bp
    from app.routes.sales     import sales_bp
    from app.routes.reports   import reports_bp
    from app.routes.users     import users_bp

    app.register_blueprint(auth_bp,      url_prefix="/api/auth")
    app.register_blueprint(products_bp,  url_prefix="/api/products")
    app.register_blueprint(inventory_bp, url_prefix="/api/inventory")
    app.register_blueprint(sales_bp,     url_prefix="/api/sales")
    app.register_blueprint(reports_bp,   url_prefix="/api/reports")
    app.register_blueprint(users_bp,     url_prefix="/api/users")


def _run_pending_migrations(app):
    """Aplica columnas nuevas que no existen aún en la BD."""
    with app.app_context():
        try:
            from sqlalchemy import text, inspect
            insp = inspect(db.engine)
            cols = [c["name"] for c in insp.get_columns("products")]
            if "image_url" not in cols:
                with db.engine.connect() as conn:
                    conn.execute(text("ALTER TABLE products ADD COLUMN image_url VARCHAR(500) NULL"))
                    conn.commit()
                app.logger.info("Migración aplicada: products.image_url")
        except Exception as e:
            app.logger.warning(f"_run_pending_migrations: {e}")


def _register_jwt_callbacks(app):
    from app.routes.auth import is_token_revoked
    jwt.token_in_blocklist_loader(is_token_revoked)


def _register_error_handlers(app):
    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({"error": "Solicitud inválida", "message": str(e)}), 400

    @app.errorhandler(401)
    def unauthorized(e):
        return jsonify({"error": "No autorizado"}), 401

    @app.errorhandler(403)
    def forbidden(e):
        return jsonify({"error": "Acceso denegado"}), 403

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Recurso no encontrado"}), 404

    @app.errorhandler(405)
    def method_not_allowed(e):
        return jsonify({"error": "Método no permitido"}), 405

    @app.errorhandler(422)
    def unprocessable(e):
        return jsonify({"error": "Datos no procesables"}), 422

    @app.errorhandler(500)
    def internal_error(e):
        app.logger.error(f"Error interno: {e}")
        return jsonify({"error": "Error interno del servidor"}), 500

    # JWT errors
    @jwt.expired_token_loader
    def expired_token(jwt_header, jwt_data):
        return jsonify({"error": "Token expirado"}), 401

    @jwt.invalid_token_loader
    def invalid_token(reason):
        return jsonify({"error": "Token inválido", "message": reason}), 401

    @jwt.unauthorized_loader
    def missing_token(reason):
        return jsonify({"error": "Token requerido", "message": reason}), 401

    @jwt.revoked_token_loader
    def revoked_token(jwt_header, jwt_data):
        return jsonify({"error": "Token revocado"}), 401
