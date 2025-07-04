from sqlalchemy.orm import Session
import models, schemas
from auth import get_password_hash
from uuid import UUID

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


# ------------------------
# ORDER LOGIC
# ------------------------

def create_order(db: Session, user_id: str, order_data: schemas.OrderCreate):
    order = models.Order(user_id=user_id)
    db.add(order)
    db.flush()  # Get the order.id before committing

    for item in order_data.items:
        db_item = models.OrderItem(
            order_id=order.id,
            book_id=item.book_id,
            title=item.title,
            price=item.price,
            quantity=item.quantity,
        )
        db.add(db_item)

    db.commit()
    db.refresh(order)
    return order

def get_user_orders(db: Session, user_id: str):
    return db.query(models.Order).filter(models.Order.user_id == user_id).all()

def get_order_by_id(db: Session, order_id: str):
    return db.query(models.Order).filter(models.Order.id == order_id).first()





def add_to_cart(db: Session, user_id: UUID, item: schemas.CartItemCreate):
    existing = db.query(models.CartItem).filter_by(user_id=user_id, book_id=item.book_id).first()
    if existing:
        existing.quantity += item.quantity
    else:
        cart_item = models.CartItem(user_id=user_id, book_id=item.book_id, quantity=item.quantity)
        db.add(cart_item)
    db.commit()


def get_cart_items(db: Session, user_id: UUID):
    items = db.query(models.CartItem).filter_by(user_id=user_id).all()
    result = []
    for item in items:
        result.append(schemas.CartItemOut(
            id=item.id,
            book_id=item.book_id,
            quantity=item.quantity,
            title=item.book.title,
            price=item.book.price,
        ))
    return result


def remove_cart_item(db: Session, user_id: UUID, book_id: UUID):
    item = db.query(models.CartItem).filter_by(user_id=user_id, book_id=book_id).first()
    if item:
        db.delete(item)
        db.commit()


def clear_cart(db: Session, user_id: UUID):
    db.query(models.CartItem).filter_by(user_id=user_id).delete()
    db.commit()


