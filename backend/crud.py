from sqlalchemy.orm import Session
import models, schemas
from auth import get_password_hash
import uuid

# ------------------------
# USER LOGIC
# ------------------------

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        username=user.username,
        email=user.email,
        role=user.role,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# ------------------------
# BOOK LOGIC
# ------------------------

def get_books(db: Session):
    return db.query(models.Book).all()

def create_book(db: Session, book: schemas.BookCreate):
    db_book = models.Book(
        title=book.title,
        author=book.author,
        price=book.price,
        description=book.description,
    )
    db.add(db_book)
    db.commit()
    db.refresh(db_book)
    return db_book

def update_book(db: Session, db_book: models.Book, book_data: schemas.BookCreate):
    db_book.title = book_data.title
    db_book.author = book_data.author
    db_book.price = book_data.price
    db_book.description = book_data.description
    db.commit()
    db.refresh(db_book)
    return db_book

def delete_book(db: Session, db_book: models.Book):
    db.delete(db_book)
    db.commit()
