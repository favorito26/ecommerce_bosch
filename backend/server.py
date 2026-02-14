from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import select, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy.types import String, Float, Integer, DateTime
import os
import logging
from pathlib import Path
from pydantic import BaseModel, EmailStr, ConfigDict
from typing import List, Optional
import uuid
import json
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
import jwt
import razorpay

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# ============= DATABASE SETUP =============
DATABASE_URL = os.environ['DATABASE_URL']
engine = create_async_engine(DATABASE_URL, echo=False)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

async def get_db():
    async with async_session() as session:
        yield session

# ============= DATABASE MODELS =============
class User(Base):
    __tablename__ = "users"
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password: Mapped[str] = mapped_column(String(255))
    name: Mapped[str] = mapped_column(String(255))
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    role: Mapped[str] = mapped_column(String(50), default="customer")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

class Product(Base):
    __tablename__ = "products"
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    name: Mapped[str] = mapped_column(String(255), index=True)
    description: Mapped[str] = mapped_column(String(2000))
    price: Mapped[float] = mapped_column(Float, index=True)
    category: Mapped[str] = mapped_column(String(100), index=True)
    images: Mapped[str] = mapped_column(String(2000))
    stock: Mapped[int] = mapped_column(Integer, default=0)
    specifications: Mapped[str] = mapped_column(String(2000))
    ratings_avg: Mapped[float] = mapped_column(Float, default=0.0)
    ratings_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

class Cart(Base):
    __tablename__ = "carts"
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(36), index=True)
    items: Mapped[str] = mapped_column(String(5000))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class Wishlist(Base):
    __tablename__ = "wishlists"
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(36), index=True, unique=True)
    product_ids: Mapped[str] = mapped_column(String(5000))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

class Review(Base):
    __tablename__ = "reviews"
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    product_id: Mapped[str] = mapped_column(String(36), index=True)
    user_id: Mapped[str] = mapped_column(String(36), index=True)
    user_name: Mapped[str] = mapped_column(String(255))
    rating: Mapped[int] = mapped_column(Integer)
    comment: Mapped[str] = mapped_column(String(1000))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

class Order(Base):
    __tablename__ = "orders"
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(36), index=True)
    items: Mapped[str] = mapped_column(String(5000))
    total_amount: Mapped[float] = mapped_column(Float)
    shipping_address: Mapped[str] = mapped_column(String(1000))
    razorpay_order_id: Mapped[str] = mapped_column(String(100))
    razorpay_payment_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    payment_status: Mapped[str] = mapped_column(String(50), default="pending")
    order_status: Mapped[str] = mapped_column(String(50), default="pending")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

# ============= PYDANTIC MODELS =============
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    email: str
    name: str
    role: str = "customer"
    phone: Optional[str] = None
    created_at: str

class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    category: str
    images: List[str]
    stock: int
    specifications: dict

class ProductResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    description: str
    price: float
    category: str
    images: List[str]
    stock: int
    specifications: dict
    ratings_avg: float = 0.0
    ratings_count: int = 0
    created_at: str

class CartItem(BaseModel):
    product_id: str
    quantity: int

class CartUpdate(BaseModel):
    items: List[CartItem]

class ReviewCreate(BaseModel):
    product_id: str
    rating: int
    comment: str

class ReviewResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    product_id: str
    user_id: str
    user_name: str
    rating: int
    comment: str
    created_at: str

class OrderItem(BaseModel):
    product_id: str
    product_name: str
    price: float
    quantity: int

class OrderCreate(BaseModel):
    items: List[OrderItem]
    total_amount: float
    shipping_address: dict
    razorpay_order_id: str

class OrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    user_id: str
    items: List[OrderItem]
    total_amount: float
    shipping_address: dict
    razorpay_order_id: str
    razorpay_payment_id: Optional[str] = None
    payment_status: str = "pending"
    order_status: str = "pending"
    created_at: str

class PaymentVerify(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

# ============= SETUP =============
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()
JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGORITHM = os.environ['JWT_ALGORITHM']
razorpay_client = razorpay.Client(auth=(os.environ['RAZORPAY_KEY_ID'], os.environ['RAZORPAY_KEY_SECRET']))

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Add CORS middleware BEFORE router
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============= UTILS =============
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(user_id: str, email: str, role: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=int(os.environ['JWT_EXPIRATION_HOURS']))
    to_encode = {"sub": user_id, "email": email, "role": role, "exp": expire}
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: AsyncSession = Depends(get_db)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_admin_user(user: User = Depends(get_current_user)):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# ============= AUTH ROUTES =============
@api_router.post("/auth/register")
async def register(user_data: UserRegister, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user_data.email))
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    user = User(
        id=user_id,
        email=user_data.email,
        password=hash_password(user_data.password),
        name=user_data.name,
        phone=user_data.phone,
        role="customer"
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    token = create_access_token(user_id, user_data.email, "customer")
    return {"token": token, "user": UserResponse.model_validate(user)}

@api_router.post("/auth/login")
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == credentials.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(credentials.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token(user.id, user.email, user.role)
    return {"token": token, "user": UserResponse.model_validate(user)}

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(user: User = Depends(get_current_user)):
    return UserResponse.model_validate(user)

# ============= PRODUCT ROUTES =============
@api_router.get("/products", response_model=List[ProductResponse])
async def get_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    min_rating: Optional[float] = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(Product)
    if category:
        query = query.where(Product.category == category)
    if search:
        query = query.where(Product.name.ilike(f"%{search}%"))
    if min_price is not None:
        query = query.where(Product.price >= min_price)
    if max_price is not None:
        query = query.where(Product.price <= max_price)
    if min_rating is not None:
        query = query.where(Product.ratings_avg >= min_rating)
    
    result = await db.execute(query.limit(1000))
    products = result.scalars().all()
    return [ProductResponse.model_validate(p) for p in products]

@api_router.get("/products/{product_id}", response_model=ProductResponse)
async def get_product(product_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return ProductResponse.model_validate(product)

@api_router.post("/products", response_model=ProductResponse)
async def create_product(product_data: ProductCreate, admin: User = Depends(get_admin_user), db: AsyncSession = Depends(get_db)):
    product_id = str(uuid.uuid4())
    product = Product(
        id=product_id,
        name=product_data.name,
        description=product_data.description,
        price=product_data.price,
        category=product_data.category,
        images=json.dumps(product_data.images),
        stock=product_data.stock,
        specifications=json.dumps(product_data.specifications)
    )
    db.add(product)
    await db.commit()
    await db.refresh(product)
    return ProductResponse.model_validate(product)

@api_router.put("/products/{product_id}", response_model=ProductResponse)
async def update_product(product_id: str, product_data: ProductCreate, admin: User = Depends(get_admin_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product.name = product_data.name
    product.description = product_data.description
    product.price = product_data.price
    product.category = product_data.category
    product.images = json.dumps(product_data.images)
    product.stock = product_data.stock
    product.specifications = json.dumps(product_data.specifications)
    
    await db.commit()
    await db.refresh(product)
    return ProductResponse.model_validate(product)

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, admin: User = Depends(get_admin_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    await db.delete(product)
    await db.commit()
    return {"message": "Product deleted"}

# ============= CART ROUTES =============
@api_router.get("/cart")
async def get_cart(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Cart).where(Cart.user_id == user.id))
    cart = result.scalar_one_or_none()
    if not cart:
        return {"items": []}
    
    items = json.loads(cart.items) if cart.items else []
    items_with_details = []
    for item in items:
        result = await db.execute(select(Product).where(Product.id == item["product_id"]))
        product = result.scalar_one_or_none()
        if product:
            items_with_details.append({**item, "product": ProductResponse.model_validate(product).model_dump()})
    
    return {"items": items_with_details}

@api_router.post("/cart")
async def update_cart(cart_data: CartUpdate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Cart).where(Cart.user_id == user.id))
    cart = result.scalar_one_or_none()
    
    items_json = json.dumps([item.model_dump() for item in cart_data.items])
    
    if cart:
        cart.items = items_json
        cart.updated_at = datetime.now(timezone.utc)
    else:
        cart = Cart(
            id=str(uuid.uuid4()),
            user_id=user.id,
            items=items_json
        )
        db.add(cart)
    
    await db.commit()
    return {"message": "Cart updated"}

# ============= WISHLIST ROUTES =============
@api_router.get("/wishlist")
async def get_wishlist(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Wishlist).where(Wishlist.user_id == user.id))
    wishlist = result.scalar_one_or_none()
    if not wishlist:
        return {"products": []}
    
    product_ids = json.loads(wishlist.product_ids) if wishlist.product_ids else []
    products = []
    for product_id in product_ids:
        result = await db.execute(select(Product).where(Product.id == product_id))
        product = result.scalar_one_or_none()
        if product:
            products.append(ProductResponse.model_validate(product))
    
    return {"products": products}

@api_router.post("/wishlist/{product_id}")
async def add_to_wishlist(product_id: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Wishlist).where(Wishlist.user_id == user.id))
    wishlist = result.scalar_one_or_none()
    
    if wishlist:
        product_ids = json.loads(wishlist.product_ids) if wishlist.product_ids else []
        if product_id not in product_ids:
            product_ids.append(product_id)
        wishlist.product_ids = json.dumps(product_ids)
    else:
        wishlist = Wishlist(
            id=str(uuid.uuid4()),
            user_id=user.id,
            product_ids=json.dumps([product_id])
        )
        db.add(wishlist)
    
    await db.commit()
    return {"message": "Added to wishlist"}

@api_router.delete("/wishlist/{product_id}")
async def remove_from_wishlist(product_id: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Wishlist).where(Wishlist.user_id == user.id))
    wishlist = result.scalar_one_or_none()
    if wishlist:
        product_ids = json.loads(wishlist.product_ids) if wishlist.product_ids else []
        if product_id in product_ids:
            product_ids.remove(product_id)
        wishlist.product_ids = json.dumps(product_ids)
        await db.commit()
    return {"message": "Removed from wishlist"}

# ============= REVIEW ROUTES =============
@api_router.get("/reviews/{product_id}", response_model=List[ReviewResponse])
async def get_reviews(product_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Review).where(Review.product_id == product_id))
    reviews = result.scalars().all()
    return [ReviewResponse.model_validate(r) for r in reviews]

@api_router.post("/reviews", response_model=ReviewResponse)
async def create_review(review_data: ReviewCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    review_id = str(uuid.uuid4())
    review = Review(
        id=review_id,
        product_id=review_data.product_id,
        user_id=user.id,
        user_name=user.name,
        rating=review_data.rating,
        comment=review_data.comment
    )
    db.add(review)
    await db.commit()
    
    result = await db.execute(select(Review).where(Review.product_id == review_data.product_id))
    all_reviews = result.scalars().all()
    avg_rating = sum(r.rating for r in all_reviews) / len(all_reviews) if all_reviews else 0
    
    result = await db.execute(select(Product).where(Product.id == review_data.product_id))
    product = result.scalar_one_or_none()
    if product:
        product.ratings_avg = avg_rating
        product.ratings_count = len(all_reviews)
        await db.commit()
    
    await db.refresh(review)
    return ReviewResponse.model_validate(review)

# ============= PAYMENT & ORDER ROUTES =============
@api_router.post("/payment/create-order")
async def create_payment_order(amount: float, user: User = Depends(get_current_user)):
    try:
        order = razorpay_client.order.create({
            "amount": int(amount * 100),
            "currency": "INR",
            "payment_capture": 1
        })
        return order
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/payment/verify")
async def verify_payment(payment_data: PaymentVerify, user: User = Depends(get_current_user)):
    try:
        params_dict = {
            "razorpay_order_id": payment_data.razorpay_order_id,
            "razorpay_payment_id": payment_data.razorpay_payment_id,
            "razorpay_signature": payment_data.razorpay_signature
        }
        razorpay_client.utility.verify_payment_signature(params_dict)
        return {"status": "verified"}
    except:
        raise HTTPException(status_code=400, detail="Payment verification failed")

@api_router.post("/orders", response_model=OrderResponse)
async def create_order(order_data: OrderCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    order_id = str(uuid.uuid4())
    order = Order(
        id=order_id,
        user_id=user.id,
        items=json.dumps([item.model_dump() for item in order_data.items]),
        total_amount=order_data.total_amount,
        shipping_address=json.dumps(order_data.shipping_address),
        razorpay_order_id=order_data.razorpay_order_id,
        payment_status="pending",
        order_status="pending"
    )
    db.add(order)
    
    result = await db.execute(select(Cart).where(Cart.user_id == user.id))
    cart = result.scalar_one_or_none()
    if cart:
        await db.delete(cart)
    
    await db.commit()
    await db.refresh(order)
    return OrderResponse.model_validate(order)

@api_router.get("/orders", response_model=List[OrderResponse])
async def get_orders(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Order).where(Order.user_id == user.id).order_by(Order.created_at.desc()).limit(1000))
    orders = result.scalars().all()
    return [OrderResponse.model_validate(o) for o in orders]

@api_router.get("/orders/{order_id}", response_model=OrderResponse)
async def get_order(order_id: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Order).where((Order.id == order_id) & (Order.user_id == user.id)))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return OrderResponse.model_validate(order)

@api_router.patch("/orders/{order_id}/payment")
async def update_order_payment(order_id: str, payment_id: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Order).where((Order.id == order_id) & (Order.user_id == user.id)))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order.razorpay_payment_id = payment_id
    order.payment_status = "completed"
    order.order_status = "confirmed"
    await db.commit()
    return {"message": "Payment updated"}

# ============= ADMIN ROUTES =============
@api_router.get("/admin/orders", response_model=List[OrderResponse])
async def get_all_orders(admin: User = Depends(get_admin_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Order).order_by(Order.created_at.desc()).limit(1000))
    orders = result.scalars().all()
    return [OrderResponse.model_validate(o) for o in orders]

@api_router.patch("/admin/orders/{order_id}")
async def update_order_status(order_id: str, order_status: str, admin: User = Depends(get_admin_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order.order_status = order_status
    await db.commit()
    return {"message": "Order status updated"}

@api_router.get("/admin/users")
async def get_all_users(admin: User = Depends(get_admin_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).limit(1000))
    users = result.scalars().all()
    return [UserResponse.model_validate(u) for u in users]

@api_router.get("/admin/stats")
async def get_admin_stats(admin: User = Depends(get_admin_user), db: AsyncSession = Depends(get_db)):
    total_products = await db.scalar(select(func.count(Product.id)))
    total_orders = await db.scalar(select(func.count(Order.id)))
    total_users = await db.scalar(select(func.count(User.id)).where(User.role == "customer"))
    
    result = await db.execute(select(Order).where(Order.payment_status == "completed").limit(10000))
    orders = result.scalars().all()
    total_revenue = sum(order.total_amount for order in orders)
    
    return {
        "total_products": total_products or 0,
        "total_orders": total_orders or 0,
        "total_users": total_users or 0,
        "total_revenue": total_revenue
    }

app.include_router(api_router)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.on_event("shutdown")
async def shutdown():
    await engine.dispose()
