from pydantic import BaseModel, EmailStr
from uuid import UUID
from typing import Optional, List
from datetime import datetime


# ======== BOOK SCHEMAS =========
class BookBase(BaseModel):
    title: str
    author: str
    price: float
    description: Optional[str] = ""

class BookCreate(BookBase):
    class Config:
        orm_mode = True

class Book(BookBase):
    id: UUID
    has_pdf: bool = False  # ✅ Indicates if PDF is uploaded for this book

    class Config:
        orm_mode = True


# ======== TOKEN SCHEMAS =========
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

    class Config:
        orm_mode = True


# ======== USER SCHEMAS =========
class UserBase(BaseModel):
    username: str
    email: Optional[EmailStr] = None

class UserCreate(UserBase):
    password: str
    role: Optional[str] = "user"

class UserOut(UserBase):
    id: UUID
    role: str

    class Config:
        orm_mode = True


class OrderItemCreate(BaseModel):
    book_id: UUID
    title: str
    price: float
    quantity: int

class OrderCreate(BaseModel):
    items: List[OrderItemCreate]

class OrderItemOut(OrderItemCreate):
    class Config:
        orm_mode = True

class OrderOut(BaseModel):
    id: UUID
    status: str
    created_at: datetime
    items: List[OrderItemOut]

    class Config:
        orm_mode = True