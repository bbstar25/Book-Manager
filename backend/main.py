from fastapi import FastAPI, Depends, HTTPException, status, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import Response
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

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
        )
        for book in books
    ]

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
    
    # Validate and read PDF
    pdf_data = None
    if pdf:
        if not pdf.content_type.startswith("application/pdf"):
            raise HTTPException(status_code=400, detail="Invalid file type for PDF")
        pdf_data = pdf.file.read()
        print(f"Received PDF: {pdf.filename}, size: {len(pdf_data)} bytes")
    else:
        print("No PDF uploaded")

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

# Get book PDF
@app.get("/books/{book_id}/pdf")
def get_book_pdf(book_id: str, db: Session = Depends(get_db)):
    db_book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not db_book or not db_book.pdf_data:
        raise HTTPException(status_code=404, detail="PDF not found")
    return Response(content=db_book.pdf_data, media_type="application/pdf")

# Delete a book
@app.delete("/books/{book_id}")
def delete_book(
    book_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.admin_only),
):
    db_book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not db_book:
        raise HTTPException(status_code=404, detail="Book not found")
    db.delete(db_book)
    db.commit()
    return {"message": "Book deleted"}

# Update book info (not file)
@app.put("/books/{book_id}", response_model=schemas.Book)
def update_book(
    book_id: str,
    book: schemas.BookCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.admin_only),
):
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

# Promote user to admin
@app.put("/users/{username}/make-admin")
def make_admin(
    username: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can promote users")
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.role = "admin"
    db.commit()
    return {"message": f"{username} is now an admin."}


@app.post("/orders", response_model=schemas.OrderOut)
def create_order(
    order: schemas.OrderCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    new_order = models.Order(user_id=current_user.id)
    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    for item in order.items:
        order_item = models.OrderItem(
            order_id=new_order.id,
            book_id=item.book_id,
            title=item.title,
            price=item.price,
            quantity=item.quantity
        )
        db.add(order_item)

    db.commit()
    db.refresh(new_order)
    return new_order


@app.get("/orders", response_model=List[schemas.OrderOut])
def get_my_orders(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    orders = db.query(models.Order).filter(models.Order.user_id == current_user.id).all()
    return orders

@app.get("/orders/{order_id}", response_model=schemas.OrderOut)
def get_order(order_id: str, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order
