from app import create_app, db
import app.models  # noqa: F401 — registra todos los modelos

flask_app = create_app()

if __name__ == "__main__":
    flask_app.run(host="0.0.0.0", port=5000, debug=flask_app.config["DEBUG"])
