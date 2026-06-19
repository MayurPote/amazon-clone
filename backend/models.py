from sqlalchemy import Column, Integer, String, Float, ForeignKey, Boolean, DateTime
from sqlalchemy.sql import func
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String)
    price = Column(Float)
    stock = Column(Integer)
    image_url = Column(String)
    rating = Column(Float, default=4.5)
    reviews = Column(Integer, default=100)
    is_best_seller = Column(Boolean, default=False)
    original_price = Column(Float)
    discount_percent = Column(Integer)

    category_id = Column(
        Integer,
        ForeignKey("categories.id")
    )


class Cart(Base):
    __tablename__ = "carts"

    id = Column(Integer, primary_key=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id")
    )


class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(Integer, primary_key=True)

    cart_id = Column(
        Integer,
        ForeignKey("carts.id")
    )

    product_id = Column(
        Integer,
        ForeignKey("products.id")
    )

    quantity = Column(Integer)


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    total_amount = Column(Float)
    status = Column(String, default="Placed")
    created_at = Column(DateTime, server_default=func.now(), nullable=True)
    delivery_address = Column(String, nullable=True)
    payment_method = Column(String, default="COD", nullable=True)


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    order_id = Column(
        Integer,
        ForeignKey("orders.id")
    )

    product_id = Column(
        Integer,
        ForeignKey("products.id")
    )

    quantity = Column(Integer)

    price = Column(Float)

class Address(Base):
    __tablename__ = "addresses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    full_name = Column(String)
    phone = Column(String)
    line1 = Column(String)
    line2 = Column(String, nullable=True)
    city = Column(String)
    state = Column(String)
    pincode = Column(String)
    is_default = Column(Boolean, default=False)


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    rating = Column(Integer)
    title = Column(String)
    body = Column(String)
    helpful_count = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now(), nullable=True)


class Wishlist(Base):
    __tablename__ = "wishlist"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id")
    )

    product_id = Column(
        Integer,
        ForeignKey("products.id")
    )