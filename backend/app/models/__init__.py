# Importar todos los modelos para que SQLAlchemy los registre
from app.models.user    import User
from app.models.product import Product, InventoryMovement
from app.models.sale    import Sale, SaleItem

__all__ = ["User", "Product", "InventoryMovement", "Sale", "SaleItem"]
