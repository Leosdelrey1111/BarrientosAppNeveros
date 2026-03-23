from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_mail import Mail

from config import get_config

# ── Extensiones (sin app aún) ──────────────────────────────────────────
db       = SQLAlchemy()
migrate  = Migrate()
jwt      = JWTManager()
bcrypt   = Bcrypt()
mail     = Mail()


def create_app(config_class=None):
    app = Flask(__name__)

    # Configuración
    cfg = config_class or get_config()
    app.config.from_object(cfg)

    # Inicializar extensiones
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    bcrypt.init_app(app)
    mail.init_app(app)

    # CORS — solo permite el frontend configurado
    CORS(app, resources={
        r"/api/*": {
            "origins": [app.config["FRONTEND_URL"]],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
        }
    })

    # Registrar blueprints
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

    # Seed command
    from app.utils.seed import register_seed_command
    register_seed_command(app)

    # Health check
    @app.get("/api/health")
    def health():
        return {"status": "ok", "service": "NeveriaPOS API"}

    return app
