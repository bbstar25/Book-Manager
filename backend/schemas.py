from pydantic import BaseModel, EmailStr
from uuid import UUID
from typing import Optional

# ======== BOOK SCHEMAS =========
class BookBase(BaseModel):
    title: str
    author: str
    price: float

class BookCreate(BookBase):
    pass

class Book(BookBase):
    id: UUID

    class Config:
        orm_mode = True

# ======== TOKEN SCHEMAS =========
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# ======== USER SCHEMAS =========
class UserBase(BaseModel):
    username: str
    email: Optional[EmailStr] = None

class UserCreate(UserBase):
    password: str

class UserOut(UserBase):
    id: UUID  # Include this to make /users/me and /register response more useful

    class Config:
        orm_mode = True


