from sqlalchemy.orm import Session
from passlib.context import CryptContext
import models, schemas
import uuid

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ------------------------
# USER LOGIC
# ------------------------

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = pwd_context.hash(user.password)
    db_user = models.User(username=user.username, email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, username: str, password: str):
    user = get_user_by_username(db, username)
    if not user:
        return False
    if not pwd_context.verify(password, user.hashed_password):
        return False
    return user

# ------------------------
# BOOK LOGIC
# ------------------------

def get_books(db: Session):
    return db.query(models.Book).all()

def create_book(db: Session, book: schemas.BookCreate):
    db_book = models.Book(
        id=uuid.uuid4(),
        title=book.title,
        author=book.author,
        price=book.price,
        description=book.description,
    )
    db.add(db_book)
    db.commit()
    db.refresh(db_book)
    return db_book
