from datetime import datetime
from app import db


class Product(db.Model):
    __tablename__ = "products"

    id           = db.Column(db.Integer, primary_key=True)
    name         = db.Column(db.String(150), nullable=False)
    category     = db.Column(
        db.Enum("Paletas", "Helados", "Sorbetes", "Raspados", name="product_categories"),
        nullable=False,
    )
    price        = db.Column(db.Numeric(10, 2), nullable=False)
    stock        = db.Column(db.Integer, default=0, nullable=False)
    stock_alert  = db.Column(db.Integer, default=10, nullable=False)
    emoji        = db.Column(db.String(10), default="🍦")
    image_url    = db.Column(db.String(500), nullable=True)
    is_active    = db.Column(db.Boolean, default=True)
    created_at   = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at   = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relaciones
    sale_items  = db.relationship("SaleItem",            back_populates="product")
    movements   = db.relationship("InventoryMovement",   back_populates="product")

    @property
    def is_low_stock(self):
        return self.stock <= self.stock_alert

    def to_dict(self):
        return {
            "id":          self.id,
            "name":        self.name,
            "category":    self.category,
            "price":       float(self.price),
            "stock":       self.stock,
            "stock_alert": self.stock_alert,
            "emoji":       self.emoji,
            "image_url":   self.image_url,
            "is_active":   self.is_active,
            "is_low_stock":self.is_low_stock,
        }

    def __repr__(self):
        return f"<Product {self.name}>"


class InventoryMovement(db.Model):
    __tablename__ = "inventory_movements"

    id          = db.Column(db.Integer, primary_key=True)
    product_id  = db.Column(db.Integer, db.ForeignKey("products.id"), nullable=False)
    user_id     = db.Column(db.Integer, db.ForeignKey("users.id"),    nullable=False)
    type        = db.Column(
        db.Enum("entrada", "salida", "venta", "ajuste", name="movement_types"),
        nullable=False,
    )
    quantity    = db.Column(db.Integer, nullable=False)
    notes       = db.Column(db.String(255))
    created_at  = db.Column(db.DateTime, default=datetime.utcnow)

    # Relaciones
    product = db.relationship("Product", back_populates="movements")
    user    = db.relationship("User",    back_populates="inventory_movements")

    def to_dict(self):
        return {
            "id":         self.id,
            "product_id": self.product_id,
            "product":    self.product.name if self.product else None,
            "user":       self.user.name    if self.user    else None,
            "type":       self.type,
            "quantity":   self.quantity,
            "notes":      self.notes,
            "created_at": self.created_at.isoformat(),
        }
