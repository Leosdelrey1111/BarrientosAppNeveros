from marshmallow import Schema, fields, validate, validates, ValidationError

VALID_CATEGORIES = ["Paletas", "Helados", "Sorbetes", "Raspados"]
VALID_ROLES      = ["admin", "cajero", "consultor"]
VALID_MOV_TYPES  = ["entrada", "salida", "ajuste"]
VALID_PAYMENTS   = ["efectivo", "tarjeta"]


class ProductSchema(Schema):
    name        = fields.Str(required=True, validate=validate.Length(min=2, max=150))
    category    = fields.Str(required=True, validate=validate.OneOf(VALID_CATEGORIES))
    price       = fields.Float(required=True, validate=validate.Range(min=0.01))
    stock       = fields.Int(load_default=0, validate=validate.Range(min=0))
    stock_alert = fields.Int(load_default=10, validate=validate.Range(min=0))
    emoji       = fields.Str(load_default="🍦", validate=validate.Length(max=10))


class ProductUpdateSchema(Schema):
    name        = fields.Str(validate=validate.Length(min=2, max=150))
    category    = fields.Str(validate=validate.OneOf(VALID_CATEGORIES))
    price       = fields.Float(validate=validate.Range(min=0.01))
    stock       = fields.Int(validate=validate.Range(min=0))
    stock_alert = fields.Int(validate=validate.Range(min=0))
    emoji       = fields.Str(validate=validate.Length(max=10))
    is_active   = fields.Bool()


class SaleItemSchema(Schema):
    product_id = fields.Int(required=True)
    quantity   = fields.Int(required=True, validate=validate.Range(min=1))


class SaleSchema(Schema):
    items          = fields.List(fields.Nested(SaleItemSchema), required=True, validate=validate.Length(min=1))
    paid           = fields.Float(required=True, validate=validate.Range(min=0))
    payment_method = fields.Str(load_default="efectivo", validate=validate.OneOf(VALID_PAYMENTS))
    notes          = fields.Str(validate=validate.Length(max=255))


class UserCreateSchema(Schema):
    name     = fields.Str(required=True, validate=validate.Length(min=2, max=100))
    email    = fields.Email(required=True)
    password = fields.Str(required=True, validate=validate.Length(min=6))
    role     = fields.Str(required=True, validate=validate.OneOf(VALID_ROLES))


class UserUpdateSchema(Schema):
    name      = fields.Str(validate=validate.Length(min=2, max=100))
    role      = fields.Str(validate=validate.OneOf(VALID_ROLES))
    is_active = fields.Bool()
    password  = fields.Str(validate=validate.Length(min=6))


class MovementSchema(Schema):
    product_id = fields.Int(required=True)
    type       = fields.Str(required=True, validate=validate.OneOf(VALID_MOV_TYPES))
    quantity   = fields.Int(required=True, validate=validate.Range(min=1))
    notes      = fields.Str(validate=validate.Length(max=255))


class LoginSchema(Schema):
    email    = fields.Email(required=True)
    password = fields.Str(required=True)


class ResetPasswordSchema(Schema):
    token    = fields.Str(required=True)
    password = fields.Str(required=True, validate=validate.Length(min=6))
