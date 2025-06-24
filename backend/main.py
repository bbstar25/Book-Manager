from fastapi import FastAPI, Depends, HTTPException, status, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import Response
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from datetime import datetime, timedelta, timezone
import models, schemas, auth, crud
from database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Register user
@app.post("/register", response_model=schemas.UserOut)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.username == user.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    return crud.create_user(db, user)

# Login
@app.post("/token", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = auth.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    access_token = auth.create_access_token(data={"sub": user.username, "role": user.role})
    return {"access_token": access_token, "token_type": "bearer"}

# Get all books
@app.get("/books", response_model=List[schemas.Book])
def read_books(db: Session = Depends(get_db)):
    books = db.query(models.Book).all()
    return [
        schemas.Book(
            id=book.id,
            title=book.title,
            author=book.author,
            price=book.price,
            description=book.description,
            has_pdf=bool(book.pdf_data)
        ) for book in books
    ]


@app.get("/books/{book_id}", response_model=schemas.Book)
def get_single_book(book_id: UUID, db: Session = Depends(get_db)):
    book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return schemas.Book(
        id=book.id,
        title=book.title,
        author=book.author,
        price=book.price,
        description=book.description,
        has_pdf=bool(book.pdf_data)
    )



# Create book with image and optional PDF
@app.post("/books", response_model=schemas.Book)
def create_book(
    title: str = Form(...),
    author: str = Form(...),
    price: float = Form(...),
    description: str = Form(...),
    image: UploadFile = File(...),
    pdf: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.admin_only),
):
    image_data = image.file.read()
    pdf_data = pdf.file.read() if pdf else None
    db_book = models.Book(
        title=title,
        author=author,
        price=price,
        description=description,
        image_data=image_data,
        pdf_data=pdf_data,
    )
    db.add(db_book)
    db.commit()
    db.refresh(db_book)
    return db_book

# Get book image
@app.get("/books/{book_id}/image")
def get_book_image(book_id: str, db: Session = Depends(get_db)):
    db_book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not db_book or not db_book.image_data:
        raise HTTPException(status_code=404, detail="Image not found")
    return Response(content=db_book.image_data, media_type="image/jpeg")

# Get book PDF (with payment check)
@app.get("/books/{book_id}/pdf")
def get_book_pdf(book_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not db_book or not db_book.pdf_data:
        raise HTTPException(status_code=404, detail="PDF not found")

    payment = db.query(models.Payment).filter_by(user_id=current_user.id, book_id=book_id).first()
    if not payment:
        raise HTTPException(status_code=403, detail="Payment required to access PDF")

    return Response(content=db_book.pdf_data, media_type="application/pdf")

# Delete book
@app.delete("/books/{book_id}")
def delete_book(book_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(auth.admin_only)):
    db_book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not db_book:
        raise HTTPException(status_code=404, detail="Book not found")
    db.delete(db_book)
    db.commit()
    return {"message": "Book deleted"}

# Update book
@app.put("/books/{book_id}", response_model=schemas.Book)
def update_book(book_id: str, book: schemas.BookCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.admin_only)):
    db_book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not db_book:
        raise HTTPException(status_code=404, detail="Book not found")
    db_book.title = book.title
    db_book.author = book.author
    db_book.price = book.price
    db_book.description = book.description
    db.commit()
    db.refresh(db_book)
    return db_book

# Get current user info
@app.get("/users/me", response_model=schemas.UserOut)
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

# Promote user
@app.put("/users/{username}/make-admin")
def make_admin(username: str, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can promote users")
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.role = "admin"
    db.commit()
    return {"message": f"{username} is now an admin."}

# Create order
@app.post("/orders", response_model=schemas.OrderOut)
def create_order(order: schemas.OrderCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    new_order = models.Order(user_id=current_user.id)
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    for item in order.items:
        db.add(models.OrderItem(order_id=new_order.id, book_id=item.book_id, title=item.title, price=item.price, quantity=item.quantity))
    db.commit()
    return new_order

# Get my orders
@app.get("/orders", response_model=List[schemas.OrderOut])
def get_my_orders(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.Order).filter(models.Order.user_id == current_user.id).all()

# Get single order
@app.get("/orders/{order_id}", response_model=schemas.OrderOut)
def get_order(order_id: str, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    now = datetime.now(timezone.utc)
    elapsed = now - order.created_at
    if order.status == "placed" and elapsed > timedelta(minutes=1):
        order.status = "processed"
    elif order.status == "processed" and elapsed > timedelta(minutes=2):
        order.status = "shipped"
    elif order.status == "shipped" and elapsed > timedelta(minutes=3):
        order.status = "delivered"
    db.commit()
    return order

# Submit rating
@app.post("/ratings", response_model=schemas.RatingOut)
def create_rating(rating: schemas.RatingCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    book = db.query(models.Book).filter_by(id=rating.book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    existing = db.query(models.Rating).filter_by(user_id=current_user.id, book_id=rating.book_id).first()
    if existing:
        existing.score = rating.score
    else:
        existing = models.Rating(user_id=current_user.id, book_id=rating.book_id, score=rating.score)
        db.add(existing)
    db.commit()
    ratings = db.query(models.Rating).filter_by(book_id=rating.book_id).all()
    average = sum(r.score for r in ratings) / len(ratings)
    book.average_rating = average
    book.rating_count = len(ratings)
    db.commit()
    return {"id": existing.id, "book_id": existing.book_id, "user_id": existing.user_id, "score": existing.score, "average_rating": average, "rating_count": len(ratings)}

# Delete order
@app.delete("/orders/{order_id}")
def delete_order(order_id: UUID, db: Session = Depends(get_db), current_user: models.User = Depends(auth.admin_only)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    db.delete(order)
    db.commit()
    return {"message": "Order deleted"}

# Payment endpoint
@app.post("/pay/{book_id}")
def pay_for_book(book_id: UUID, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    book = db.query(models.Book).filter_by(id=book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    existing = db.query(models.Payment).filter_by(user_id=current_user.id, book_id=book_id).first()
    if existing:
        return {"message": "Already paid for this book."}
    payment = models.Payment(user_id=current_user.id, book_id=book_id)
    db.add(payment)
    db.commit()
    return {"message": "Payment successful. You can now access the PDF."}



# Check if user has access (payment made) to book PDF
@app.get("/books/{book_id}/access")
def check_book_access(book_id: UUID, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    payment = db.query(models.Payment).filter_by(user_id=current_user.id, book_id=book_id).first()
    return {"has_access": bool(payment)}
