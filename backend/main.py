from fastapi import FastAPI, Depends, HTTPException, status, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import Response
from sqlalchemy.orm import Session
from typing import List

import models, schemas, auth, crud
from database import SessionLocal, engine

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency: DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ============================
# User Registration
# ============================
@app.post("/register", response_model=schemas.UserOut)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.username == user.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    return crud.create_user(db, user)

# ============================
# User Login (Token Generation)
# ============================
@app.post("/token", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = auth.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    access_token = auth.create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

# ============================
# Get All Books (Public)
# ============================
@app.get("/books", response_model=List[schemas.Book])
def read_books(db: Session = Depends(get_db)):
    return crud.get_books(db)

# ============================
# Create Book (with file upload)
# ============================
@app.post("/books", response_model=schemas.Book)
def create_book(
    title: str = Form(...),
    author: str = Form(...),
    price: float = Form(...),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    image_data = image.file.read()
    db_book = models.Book(title=title, author=author, price=price, image_data=image_data)
    db.add(db_book)
    db.commit()
    db.refresh(db_book)
    return db_book

# ============================
# Get Book Image (Public)
# ============================
@app.get("/books/{book_id}/image")
def get_book_image(
    book_id: str,
    db: Session = Depends(get_db)
):
    db_book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not db_book or not db_book.image_data:
        raise HTTPException(status_code=404, detail="Image not found")
    return Response(content=db_book.image_data, media_type="image/jpeg")

# ============================
# Delete Book (Protected)
# ============================
@app.delete("/books/{book_id}")
def delete_book(
    book_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    db_book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not db_book:
        raise HTTPException(status_code=404, detail="Book not found")
    db.delete(db_book)
    db.commit()
    return {"message": "Book deleted"}

# ============================
# Update Book (Protected)
# ============================
@app.put("/books/{book_id}", response_model=schemas.Book)
def update_book(
    book_id: str,
    book: schemas.BookCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    db_book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not db_book:
        raise HTTPException(status_code=404, detail="Book not found")
    db_book.title = book.title
    db_book.author = book.author
    db.commit()
    db.refresh(db_book)
    return db_book

# ============================
# Get Current Logged-in User
# ============================
@app.get("/users/me", response_model=schemas.UserOut)
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

