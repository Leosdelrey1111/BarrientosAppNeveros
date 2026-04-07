"""
Capa de servicios: lógica de negocio desacoplada de las rutas HTTP.
"""
from app import db
from app.models.sale    import Sale, SaleItem
from app.models.product import Product, InventoryMovement


class SaleService:
    @staticmethod
    def create(cashier_id: int, items: list, paid: float, payment_method: str, notes: str = None):
        total = 0
        validated = []

        for item in items:
            product = Product.query.filter_by(id=item["product_id"], is_active=True).first()
            if not product:
                raise ValueError(f"Producto {item['product_id']} no encontrado")

            qty = item["quantity"]
            if product.stock < qty:
                raise ValueError(f"Stock insuficiente para '{product.name}' (disponible: {product.stock})")

            subtotal = float(product.price) * qty
            total   += subtotal
            validated.append((product, qty, float(product.price), subtotal))

        if paid < total:
            raise ValueError(f"Pago insuficiente. Total: ${total:.2f}")

        sale = Sale(
            cashier_id     = cashier_id,
            total          = round(total, 2),
            paid           = round(paid, 2),
            change         = round(paid - total, 2),
            payment_method = payment_method,
            notes          = notes,
        )
        db.session.add(sale)
        db.session.flush()

        for product, qty, unit_price, subtotal in validated:
            db.session.add(SaleItem(
                sale_id=sale.id, product_id=product.id,
                quantity=qty, unit_price=unit_price, subtotal=subtotal,
            ))
            product.stock -= qty
            db.session.add(InventoryMovement(
                product_id=product.id, user_id=cashier_id,
                type="venta", quantity=-qty, notes=f"Venta #{sale.id}",
            ))

        db.session.commit()
        return sale


class InventoryService:
    @staticmethod
    def register_movement(product: Product, user_id: int, mov_type: str, quantity: int, notes: str = None):
        if mov_type == "salida" and product.stock < quantity:
            raise ValueError("Stock insuficiente")

        if   mov_type == "entrada": product.stock += quantity
        elif mov_type == "salida":  product.stock -= quantity
        elif mov_type == "ajuste":  product.stock  = quantity

        movement = InventoryMovement(
            product_id=product.id, user_id=user_id,
            type=mov_type, quantity=quantity, notes=notes,
        )
        db.session.add(movement)
        db.session.commit()
        return movement
