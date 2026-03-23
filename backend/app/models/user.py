from datetime import datetime
from app import db, bcrypt


class User(db.Model):
    __tablename__ = "users"

    id         = db.Column(db.Integer, primary_key=True)
    name       = db.Column(db.String(100), nullable=False)
    email      = db.Column(db.String(150), unique=True, nullable=False, index=True)
    password   = db.Column(db.String(255), nullable=False)
    role       = db.Column(
        db.Enum("admin", "cajero", "consultor", name="user_roles"),
        nullable=False,
        default="cajero",
    )
    is_active  = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relaciones
    sales              = db.relationship("Sale",              back_populates="cashier")
    inventory_movements = db.relationship("InventoryMovement", back_populates="user")

    def set_password(self, raw_password: str):
        self.password = bcrypt.generate_password_hash(raw_password).decode("utf-8")

    def check_password(self, raw_password: str) -> bool:
        return bcrypt.check_password_hash(self.password, raw_password)

    def to_dict(self):
        return {
            "id":         self.id,
            "name":       self.name,
            "email":      self.email,
            "role":       self.role,
            "is_active":  self.is_active,
            "created_at": self.created_at.isoformat(),
        }

    def __repr__(self):
        return f"<User {self.email} [{self.role}]>"
