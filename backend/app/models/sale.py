from datetime import datetime
from app import db


class Sale(db.Model):
    __tablename__ = "sales"

    id             = db.Column(db.Integer, primary_key=True)
    cashier_id     = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    total          = db.Column(db.Numeric(10, 2), nullable=False)
    paid           = db.Column(db.Numeric(10, 2), nullable=False)
    change         = db.Column(db.Numeric(10, 2), nullable=False, default=0)
    payment_method = db.Column(
        db.Enum("efectivo", "tarjeta", name="payment_methods"),
        nullable=False,
        default="efectivo",
    )
    notes      = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)

    # Relaciones
    cashier = db.relationship("User",     back_populates="sales")
    items   = db.relationship("SaleItem", back_populates="sale", cascade="all, delete-orphan")

    def to_dict(self, include_items=False):
        data = {
            "id":             self.id,
            "cashier":        self.cashier.name if self.cashier else None,
            "total":          float(self.total),
            "paid":           float(self.paid),
            "change":         float(self.change),
            "payment_method": self.payment_method,
            "item_count":     len(self.items),
            "created_at":     self.created_at.isoformat(),
        }
        if include_items:
            data["items"] = [i.to_dict() for i in self.items]
        return data

    def __repr__(self):
        return f"<Sale #{self.id} ${self.total}>"


class SaleItem(db.Model):
    __tablename__ = "sale_items"

    id         = db.Column(db.Integer, primary_key=True)
    sale_id    = db.Column(db.Integer, db.ForeignKey("sales.id"),    nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey("products.id"), nullable=False)
    quantity   = db.Column(db.Integer, nullable=False)
    unit_price = db.Column(db.Numeric(10, 2), nullable=False)
    subtotal   = db.Column(db.Numeric(10, 2), nullable=False)

    # Relaciones
    sale    = db.relationship("Sale",    back_populates="items")
    product = db.relationship("Product", back_populates="sale_items")

    def to_dict(self):
        return {
            "product_id":   self.product_id,
            "product_name": self.product.name  if self.product else None,
            "product_emoji":self.product.emoji if self.product else None,
            "quantity":     self.quantity,
            "unit_price":   float(self.unit_price),
            "subtotal":     float(self.subtotal),
        }
