import uuid
from sqlalchemy import Column, String, DateTime, Float, LargeBinary, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from database import Base
from sqlalchemy import Integer, ForeignKey
from sqlalchemy.orm import relationship

class Book(Base):
    __tablename__ = "books"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    title = Column(String, index=True, nullable=False)
    author = Column(String, index=True, nullable=False)
    price = Column(Float, nullable=False)
    description = Column(String, nullable=False)
    image_data = Column(LargeBinary)
    pdf_data = Column(LargeBinary , nullable=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # ✅ Add these two new columns
    average_rating = Column(Float, default=0.0)
    rating_count = Column(Integer, default=0)

    ratings = relationship("Rating", back_populates="book", cascade="all, delete")
    order_items = relationship("OrderItem", back_populates="book", cascade="all, delete")

    def __repr__(self):
        return f"<Book(title='{self.title}', author='{self.author}')>"


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="user")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    ratings = relationship("Rating", back_populates="user")
    orders = relationship("Order", back_populates="user", cascade="all, delete")

    def __repr__(self):
        return f"<User(username='{self.username}', role='{self.role}')>"
    
   


class Order(Base):
    __tablename__ = "orders"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    status = Column(String, default="placed")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete")

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"))
    book_id = Column(UUID(as_uuid=True), ForeignKey("books.id"))
    title = Column(String)
    price = Column(Float)
    quantity = Column(Float)
    
    book = relationship("Book", back_populates="order_items")
    order = relationship("Order", back_populates="items")
    
    
class Rating(Base):
    __tablename__ = "ratings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    book_id = Column(UUID(as_uuid=True), ForeignKey("books.id"))
    score = Column(Integer)  # Rating from 1 to 5
    user = relationship("User", back_populates="ratings")
    book = relationship("Book", back_populates="ratings")
